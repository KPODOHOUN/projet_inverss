const mongoose = require('mongoose');

// An admin-defined simulation scenario: "Bitcoin, 24h, +1%". A user redeems
// the code to open a position on that asset; when the scenario's duration
// elapses, the settlement job applies exactly this pre-defined outcome —
// never a live/external market result. Everything here is immutable once
// the code has been redeemed at least once, so a scenario can't be quietly
// rewritten after someone has already traded against it (see adminController
// for the enforcement — this schema just carries the data).
const tradingCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  asset: { type: String, required: true }, // TradingAsset.key
  durationHours: { type: Number, required: true, min: 1 },
  variationPercent: { type: Number, required: true }, // signed — the scenario's defined price move
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxUses: { type: Number, default: 1, min: 1 },
  // Incremented atomically at redemption time (findOneAndUpdate + $expr
  // guard against maxUses) — the source of truth for the usage limit.
  // `redemptions` below stays as the human-readable audit trail; it is no
  // longer what the limit check reads, since reading array length and then
  // writing it back non-atomically is exactly what let concurrent requests
  // all pass the check before any of them had recorded their use.
  usedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'active', 'disabled', 'expired'], default: 'draft' },
  assignedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = any verified user
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  redemptions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingPosition' },
    redeemedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

tradingCodeSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('TradingCode', tradingCodeSchema);
