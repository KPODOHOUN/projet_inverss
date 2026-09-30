require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const InvestmentPack = require('./models/InvestmentPack');
const PlatformConfig = require('./models/PlatformConfig');
const AcademyVideo = require('./models/AcademyVideo');
const TradingAsset = require('./models/TradingAsset');

const seed = async () => {
  await connectDB();

  const admin = await User.findOne({ email: 'admin@imc.com' });
  if (!admin) {
    // Seeded by the operator, not self-registered — skip the OTP step real
    // sign-ups go through.
    await User.create({ firstName: 'Admin', lastName: 'IMC', email: 'admin@imc.com', password: 'Admin123!', role: 'superadmin', kycStatus: 'verified', emailVerified: true });
    console.log('Admin created: admin@imc.com / Admin123!');
  } else if (!admin.emailVerified) {
    admin.emailVerified = true;
    await admin.save();
    console.log('Admin account marked as email-verified');
  }

  // 11 packs themed after real market indices (ETF-diversification concept),
  // each with its own minimum, ROI range and duration — realistic, capped
  // returns, never the "double your money" figures from the rejected
  // ETF-doubling draft. Turbo 48H stays a separate, distinct high-risk
  // product exactly as in the official IMC presentation.
  const packs = [
    { key: 'cac40', name: 'CAC 40', minAmount: 25, maxAmount: 49, roi: '3-3.5', duration: 5, durationUnit: 'days', description: 'Pack thématique CAC 40 — l\'entrée la plus accessible' },
    { key: 'eurostoxx50', name: 'Euro Stoxx 50', minAmount: 50, maxAmount: 99, roi: '3.5-4', duration: 7, durationUnit: 'days', description: 'Pack thématique Euro Stoxx 50 — commencez votre voyage d\'investissement' },
    { key: 'ftse100', name: 'FTSE 100', minAmount: 100, maxAmount: 199, roi: '4-4.5', duration: 10, durationUnit: 'days', description: 'Pack thématique FTSE 100' },
    { key: 'nikkei225', name: 'Nikkei 225', minAmount: 200, maxAmount: 299, roi: '4.5-5', duration: 14, durationUnit: 'days', description: 'Pack thématique Nikkei 225' },
    { key: 'dowjones30', name: 'Dow Jones 30', minAmount: 300, maxAmount: 499, roi: '5-5.5', duration: 18, durationUnit: 'days', description: 'Pack thématique Dow Jones 30' },
    { key: 'nasdaq100', name: 'Nasdaq 100', minAmount: 500, maxAmount: 999, roi: '5.5-6', duration: 21, durationUnit: 'days', description: 'Pack thématique Nasdaq 100 — amplifiez vos rendements' },
    { key: 'sp500', name: 'S&P 500', minAmount: 1000, maxAmount: 1999, roi: '6-6.5', duration: 25, durationUnit: 'days', description: 'Pack thématique S&P 500 — le benchmark le plus suivi' },
    { key: 'russell2000', name: 'Raffinerie Dangote', minAmount: 2000, maxAmount: 2999, roi: '6.5-7', duration: 30, durationUnit: 'days', description: 'Pack thématique inspiré de la raffinerie Dangote — investissement professionnel' },
    { key: 'bund', name: 'Bund', minAmount: 3000, maxAmount: 4999, roi: '7-7.5', duration: 35, durationUnit: 'days', description: 'Pack thématique Bund — pour grands investisseurs' },
    { key: 'tbonds', name: 'T-Bonds', minAmount: 5000, maxAmount: 9999, roi: '7.5-8.5', duration: 45, durationUnit: 'days', description: 'Pack thématique T-Bonds — pack élite' },
    { key: 'us10y', name: 'US 10Y', minAmount: 10000, maxAmount: null, roi: '8.5-10', duration: 60, durationUnit: 'days', description: 'Pack thématique US 10Y — investissement institutionnel' },
    { key: 'turbo48h', name: 'Turbo 48H', minAmount: 200, maxAmount: 20000, roi: '6', duration: 48, durationUnit: 'hours', description: 'Opportunité de trading à haute fréquence' }
  ];

  for (const pack of packs) {
    await InvestmentPack.findOneAndUpdate({ key: pack.key }, pack, { upsert: true });
  }
  // Drop packs from the old 6-tier lineup (starter/booster/pro/elite/diamond)
  // now that the schema enum only allows the 11 index keys + turbo48h.
  await InvestmentPack.deleteMany({ key: { $nin: packs.map(p => p.key) } });
  console.log('Investment packs seeded');

  await PlatformConfig.findOneAndUpdate({}, {
    platformName: 'IMC', supportEmail: 'support@imc.com',
    withdrawalFee: 2, minWithdrawal: 1, maxWithdrawal: 50000,
    modules: { academy: true, referral: true }
  }, { upsert: true });
  console.log('Platform config seeded');

  const academyVideos = [
    { title: 'Introduction à la Crypto', level: 1, duration: 300, category: 'crypto', youtubeId: 'dQw4w9WgXcQ', description: 'Les bases de la cryptomonnaie' },
    { title: 'Stratégies d\'investissement', level: 2, duration: 600, category: 'investment', youtubeId: 'dQw4w9WgXcQ', description: 'Techniques avancées' }
  ];
  const AcademyProgress = require('./models/AcademyProgress');
  const referencedIds = new Set(
    (await AcademyProgress.find({}, 'completedVideos')).flatMap(p => p.completedVideos.map(String))
  );
  for (const video of academyVideos) {
    // Previous insertMany-based seeding created a fresh duplicate per run —
    // collapse every existing copy of this title down to one before upserting.
    const copies = await AcademyVideo.find({ title: video.title }).sort({ createdAt: 1 });
    const keeper = copies.find(c => referencedIds.has(String(c._id))) || copies[0];
    if (keeper) {
      await AcademyVideo.updateOne({ _id: keeper._id }, { $set: video });
      await AcademyVideo.deleteMany({ title: video.title, _id: { $ne: keeper._id } });
    } else {
      await AcademyVideo.create(video);
    }
  }
  console.log('Academy videos seeded');

  // Bitcoin and EUR/USDT pull real prices from free public APIs (CoinGecko,
  // Frankfurter) — see marketDataService.js. Gold, Nasdaq and the Dollar
  // Index have no reliable free no-key source, so they stay on the
  // simulated generator; basePrice is their anchor either way (a fallback
  // for the live ones, the only source for the simulated ones).
  const tradingAssets = [
    { key: 'bitcoin', name: 'Bitcoin', category: 'crypto', symbol: 'BTC', basePrice: 65000, priceSource: 'live', externalProvider: 'coingecko', externalId: 'bitcoin' },
    { key: 'gold', name: 'Or', category: 'commodity', symbol: 'XAU', basePrice: 2400, priceSource: 'simulated' },
    { key: 'nasdaq', name: 'Nasdaq', category: 'index', symbol: 'NDX', basePrice: 19500, priceSource: 'simulated' },
    { key: 'eurusdt', name: 'EUR/USDT', category: 'forex', symbol: 'EURUSDT', basePrice: 1.08, priceSource: 'live', externalProvider: 'frankfurter', externalId: 'EUR:USD' },
    { key: 'usd', name: 'Dollar Index', category: 'forex', symbol: 'DXY', basePrice: 104, priceSource: 'simulated' }
  ];
  for (const asset of tradingAssets) {
    await TradingAsset.findOneAndUpdate({ key: asset.key }, { $set: asset }, { upsert: true });
  }
  console.log('Trading assets seeded');

  console.log('Seed complete!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
