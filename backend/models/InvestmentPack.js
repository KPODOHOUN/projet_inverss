const mongoose = require('mongoose');

const investmentPackSchema = new mongoose.Schema({
  key: { type: String, enum: ['starter', 'booster', 'pro', 'elite', 'diamond', 'turbo48h'], unique: true },
  name: { type: String, required: true },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, default: null },
  roi: { type: String, required: true },
  duration: { type: Number, required: true },
  durationUnit: { type: String, enum: ['hours', 'days', 'weeks'], default: 'days' },
  description: { type: String, default: '' },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('InvestmentPack', investmentPackSchema);
