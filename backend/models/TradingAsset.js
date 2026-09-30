const mongoose = require('mongoose');

const tradingAssetSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['crypto', 'commodity', 'index', 'forex'], default: 'crypto' },
  symbol: { type: String, default: '' },
  // Reference/fallback price used when there's no live source, or a live
  // fetch fails — an illustrative anchor, not a market feed.
  basePrice: { type: Number, required: true },
  // 'live' pulls real data from a free public API (see marketDataService);
  // 'simulated' always uses the deterministic generator. Falls back to
  // simulated automatically if a live fetch fails for any reason.
  priceSource: { type: String, enum: ['live', 'simulated'], default: 'simulated' },
  externalProvider: { type: String, enum: ['coingecko', 'frankfurter', null], default: null },
  externalId: { type: String, default: '' }, // e.g. 'bitcoin' (coingecko) or 'EUR:USD' (frankfurter)
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TradingAsset', tradingAssetSchema);
