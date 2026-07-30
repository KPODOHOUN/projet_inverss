const mongoose = require('mongoose');

const vipLevelSchema = new mongoose.Schema({
  id: { type: String, enum: ['bronze', 'silver', 'gold', 'diamond', 'ambassador'], unique: true },
  tier: { type: String, required: true },
  name: { type: String, required: true },
  destination: { type: String, default: '' },
  quarter: { type: String, default: '' },
  thresholds: {
    referrals: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    special: { type: String, default: '' }
  },
  perks: [String]
});

module.exports = mongoose.model('VIPExpeditionLevel', vipLevelSchema);
