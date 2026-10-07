const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'investment', 'refund', 'earning', 'commission', 'reinvestment', 'trading'], required: true },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  // 'approved'/'processing' give withdrawals a real audit trail between "an
  // admin signed off on this" and "the USDT actually left the platform" —
  // deposits skip straight from pending to completed since verifying the
  // on-chain tx hash is the whole job, nothing left to process afterward.
  status: { type: String, enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled', 'failed'], default: 'pending' },
  method: { type: String, default: '' },
  reference: { type: String, unique: true },
  proof: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  // Set once an admin triggers the automated NOWPayments payout for a
  // withdrawal — payoutId is the batch id (status lookups), withdrawalId is
  // the individual payout's id (what the 2FA verify call targets).
  nowpaymentsPayoutId: { type: String, default: '' },
  nowpaymentsWithdrawalId: { type: String, default: '' },
  nowpaymentsStatus: { type: String, default: '' },
  // A user can mask a transaction from their own history view — the row
  // itself is never deleted, so admin reporting, balances, and audits stay
  // complete regardless of what any individual user has hidden.
  hiddenForUser: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Every wallet/transaction-history read filters by userId and sorts by date.
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });

transactionSchema.pre('save', function (next) {
  if (!this.reference) {
    this.reference = 'TXN' + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
