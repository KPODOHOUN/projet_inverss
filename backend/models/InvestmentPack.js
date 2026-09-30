const mongoose = require('mongoose');

const investmentPackSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: ['cac40', 'eurostoxx50', 'ftse100', 'nikkei225', 'dowjones30', 'nasdaq100', 'sp500', 'russell2000', 'bund', 'tbonds', 'us10y', 'turbo48h'],
    unique: true
  },
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
