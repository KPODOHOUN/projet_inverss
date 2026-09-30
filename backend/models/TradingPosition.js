const mongoose = require('mongoose');

// Two entirely independent ways a position gets opened:
// - 'code': the user redeemed an admin-issued scenario code — the payout is
//   exactly the code's variationPercent, regardless of BUY/SELL (see
//   tradingSettlement.js). For people who don't want to read a chart.
// - 'self': the user picked BUY/SELL themselves, right on the chart, like a
//   Deriv-style rise/fall contract — settled by comparing the real (or
//   simulated, if the asset has no live feed) exit price against the entry
//   price. For people who trade on their own read of the market.
const tradingPositionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['code', 'self'], required: true },
  asset: { type: String, required: true },
  // Meaningless for 'code' positions (the code's percentage applies
  // regardless of direction) — only required, and only affects the
  // outcome, for 'self' positions.
  type: { type: String, enum: ['BUY', 'SELL'], required: function () { return this.mode === 'self'; } },
  amount: { type: Number, required: true },
  entryPrice: { type: Number, required: true },

  // 'code' mode only
  code: { type: String, default: null },
  variationPercent: { type: Number, default: null },

  // 'self' mode only
  payoutPercent: { type: Number, default: null }, // snapshot of the platform rate at open
  exitPrice: { type: Number, default: null },
  priceSource: { type: String, enum: ['live', 'simulated', null], default: null },
  outcome: { type: String, enum: ['win', 'loss', 'tie', null], default: null },

  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  resultAmount: { type: Number, default: 0 },
  openedAt: { type: Date, default: Date.now },
  closesAt: { type: Date, required: true },
  closedAt: { type: Date, default: null }
});

tradingPositionSchema.index({ userId: 1, status: 1 });
tradingPositionSchema.index({ status: 1, closesAt: 1 });

module.exports = mongoose.model('TradingPosition', tradingPositionSchema);
