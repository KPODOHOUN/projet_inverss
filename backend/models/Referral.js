const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: Number, default: 1 },
  commissionsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referredId: 1 }, { unique: true });

module.exports = mongoose.model('Referral', referralSchema);
