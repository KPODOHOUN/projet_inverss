require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const InvestmentPack = require('./models/InvestmentPack');
const MiningConfig = require('./models/MiningConfig');
const PlatformConfig = require('./models/PlatformConfig');
const VIPExpeditionLevel = require('./models/VIPExpeditionLevel');
const Ad = require('./models/Ad');
const AcademyVideo = require('./models/AcademyVideo');

const seed = async () => {
  await connectDB();

  const admin = await User.findOne({ email: 'admin@neliaxa.com' });
  if (!admin) {
    await User.create({ firstName: 'Admin', lastName: 'NELIAXA', email: 'admin@neliaxa.com', password: 'Admin123!', role: 'superadmin', kycStatus: 'verified' });
    console.log('Admin created: admin@neliaxa.com / Admin123!');
  }

  const packs = [
    { key: 'starter', name: 'Starter', minAmount: 50, maxAmount: 499, roi: '4-6', duration: 7, durationUnit: 'days', description: 'Commencez votre voyage d\'investissement' },
    { key: 'booster', name: 'Booster', minAmount: 500, maxAmount: 1999, roi: '6-8', duration: 14, durationUnit: 'days', description: 'Boostez vos rendements' },
    { key: 'pro', name: 'Pro', minAmount: 2000, maxAmount: 9999, roi: '8-10', duration: 21, durationUnit: 'days', description: 'Investissement professionnel' },
    { key: 'elite', name: 'Elite', minAmount: 10000, maxAmount: 49999, roi: '10-12', duration: 30, durationUnit: 'days', description: 'Pack élite pour grands investisseurs' },
    { key: 'diamond', name: 'Diamond', minAmount: 50000, maxAmount: null, roi: '12-15', duration: 45, durationUnit: 'days', description: 'Investissement diamant premium' },
    { key: 'turbo48h', name: 'Turbo 48H', minAmount: 100, maxAmount: 5000, roi: '2-4', duration: 48, durationUnit: 'hours', description: 'Rendement rapide en 48 heures' }
  ];

  for (const pack of packs) {
    await InvestmentPack.findOneAndUpdate({ key: pack.key }, pack, { upsert: true });
  }
  console.log('Investment packs seeded');

  const robotConfigs = [
    { id: 'neo', name: 'Neo Miner', level: 1, price: 5000, nlxPerHour: 0.5, dailyCap: 12, manualTaps: 50, lifetimeDays: 30, referral: { 'Niv.1': 10, 'Niv.2': 5 } },
    { id: 'crypto', name: 'Crypto-Digger', level: 2, price: 15000, nlxPerHour: 1.5, dailyCap: 36, manualTaps: 150, lifetimeDays: 45, referral: { 'Niv.1': 12, 'Niv.2': 6 } },
    { id: 'visionnaire', name: 'Quantum-Master', level: 3, price: 50000, nlxPerHour: 5, dailyCap: 120, manualTaps: -1, lifetimeDays: 60, referral: { 'Niv.1': 15, 'Niv.2': 8 } }
  ];

  await MiningConfig.findOneAndUpdate({}, {
    enabled: true, rewardPerBlock: 0.5, difficulty: 'medium',
    maxHashratePerPack: { starter: 100, booster: 500, pro: 2000, elite: 8000, diamond: 30000 },
    robots: robotConfigs
  }, { upsert: true });
  console.log('Mining config seeded');

  await PlatformConfig.findOneAndUpdate({}, {
    platformName: 'NELIAXA', supportEmail: 'support@neliaxa.com',
    withdrawalFee: 2, minWithdrawal: 1, maxWithdrawal: 50000,
    modules: { mining: true, watchToEarn: true, academy: true, referral: true, vipExpeditions: true },
    nlxRate: 0.5
  }, { upsert: true });
  console.log('Platform config seeded');

  const levels = [
    { id: 'bronze', tier: '\uD83E\uDD47 Bronze', name: 'Bronze', destination: 'Sénégal', quarter: 'Q1 2025', thresholds: { referrals: 5, revenue: 5000 }, perks: ['Hébergement 5*', 'Transport local', 'Dîner de gala'] },
    { id: 'silver', tier: '\uD83E\uDD48 Silver', name: 'Silver', destination: 'Maroc', quarter: 'Q2 2025', thresholds: { referrals: 15, revenue: 25000 }, perks: ['Hébergement 5*', 'Transport local', 'Dîner de gala', 'Excursion'] },
    { id: 'gold', tier: '\uD83E\uDD49 Gold', name: 'Gold', destination: 'Dubai', quarter: 'Q3 2025', thresholds: { referrals: 30, revenue: 75000 }, perks: ['Vol aller-retour', 'Hébergement 5*', 'Transport local', 'Dîner de gala', 'Shopping'] },
    { id: 'diamond', tier: '\uD83D\uDC8E Diamond', name: 'Diamond', destination: 'Maldives', quarter: 'Q4 2025', thresholds: { referrals: 50, revenue: 150000 }, perks: ['Vol aller-retour', 'Villa privée', 'Transport local', 'Dîner de gala', 'Spa'] },
    { id: 'ambassador', tier: '\uD83C\uDFC6 Ambassador', name: 'Ambassador', destination: 'Miami', quarter: 'AnnuEL', thresholds: { referrals: 100, revenue: 500000, special: 'Invitation spéciale' }, perks: ['Vol aller-retour', 'Suite présidentielLE', 'Transport VIP', 'Gala', 'Rencontre CEO'] }
  ];

  for (const level of levels) {
    await VIPExpeditionLevel.findOneAndUpdate({ id: level.id }, level, { upsert: true });
  }
  console.log('VIP levels seeded');

  await Ad.insertMany([
    { title: 'NELIAXA Platform', description: 'Découvrez notre plateforme', duration: 30, reward: 1, type: 'internal' },
    { title: 'Crypto News', description: 'Actualités crypto', duration: 45, reward: 1.5, type: 'partner' }
  ]);
  console.log('Ads seeded');

  await AcademyVideo.insertMany([
    { title: 'Introduction à la Crypto', level: 1, duration: 300, reward: 5, category: 'crypto', youtubeId: 'dQw4w9WgXcQ', description: 'Les bases de la cryptomonnaie' },
    { title: 'Stratégies d\'investissement', level: 2, duration: 600, reward: 10, category: 'investment', youtubeId: 'dQw4w9WgXcQ', description: 'Techniques avancées' }
  ]);
  console.log('Academy videos seeded');

  console.log('Seed complete!');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
