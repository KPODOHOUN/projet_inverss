const mongoose = require('mongoose');

// A single document holding the platform-wide settings for self-directed
// (BUY/SELL-on-the-chart) trades — separate from scenario codes, which
// carry their own terms per code.
const tradingConfigSchema = new mongoose.Schema({
  payoutPercent: { type: Number, default: 85 }, // paid on top of the stake when the direction call is correct
  durationsMinutes: { type: [Number], default: [1, 5, 15, 60] }
});

module.exports = mongoose.model('TradingConfig', tradingConfigSchema);
