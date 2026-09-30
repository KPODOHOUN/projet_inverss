const mongoose = require('mongoose');

// A detailed, auditable ledger entry per commission payout — one row per
// settled investment that generated a commission, so an admin can trace
// exactly which referred user's earnings funded which payout, when.
const ambassadorCommissionSchema = new mongoose.Schema({
  ambassadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
  sourceEarnings: { type: Number, required: true }, // the referred user's realized earnings this commission is based on
  commissionAmount: { type: Number, required: true },
  rate: { type: Number, required: true }, // % rate snapshotted at calculation time
  status: { type: String, enum: ['completed', 'adjusted', 'voided'], default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

ambassadorCommissionSchema.index({ ambassadorId: 1, createdAt: -1 });

module.exports = mongoose.model('AmbassadorCommission', ambassadorCommissionSchema);
