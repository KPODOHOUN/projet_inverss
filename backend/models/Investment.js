const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pack: { type: String, required: true },
  amount: { type: Number, required: true },
  roi: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'pending', 'failed', 'cancelled'], default: 'active' },
  paymentMethod: { type: String, default: '' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// { userId, status } — the dashboard filter by a user's active investments.
investmentSchema.index({ userId: 1, status: 1 });
// { status, endDate } — the maturity cron scans for matured investments every
// 15 minutes; without this it's a full collection scan on every run.
investmentSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Investment', investmentSchema);
