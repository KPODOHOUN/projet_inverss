const mongoose = require('mongoose');

// Mirrors Referral.js but for the Ambassador program — kept as a separate
// model (not reusing Referral) so the two commission systems never mix in
// the database, per the program's requirement.
const ambassadorReferralSchema = new mongoose.Schema({
  ambassadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  commissionsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

ambassadorReferralSchema.index({ ambassadorId: 1 });

module.exports = mongoose.model('AmbassadorReferral', ambassadorReferralSchema);
