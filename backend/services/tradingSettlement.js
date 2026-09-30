const cron = require('node-cron');
const User = require('../models/User');
const TradingAsset = require('../models/TradingAsset');
const TradingPosition = require('../models/TradingPosition');
const Transaction = require('../models/Transaction');
const TradingCode = require('../models/TradingCode');
const marketData = require('../services/marketDataService');

// 'code' positions: apply exactly the outcome the admin defined on the code
// at redemption time (position.variationPercent, frozen then) — never a
// live/external price, and never flipped by direction (there is none for
// this mode). The payout is floored at 0 so a user never loses more than
// they engaged.
const settleCodePosition = (position) => {
  const resultAmount = Number((position.amount * (position.variationPercent / 100)).toFixed(2));
  const payout = Math.max(0, Number((position.amount + resultAmount).toFixed(2)));
  return { resultAmount, payout, outcome: resultAmount >= 0 ? 'win' : 'loss' };
};

// 'self' positions: a Deriv-style rise/fall contract — compare the real (or
// simulated, if the asset has no live feed) exit price against the entry
// price actually recorded at open. BUY wins if price rose, SELL wins if it
// fell; an exact tie refunds the stake. Win pays the configured percentage
// on top of the stake; loss forfeits the stake entirely — this is the one
// mode where the market (not an admin-defined number) decides the outcome,
// which is exactly why it needs a real observed price change, not a code.
const settleSelfPosition = async (position) => {
  const asset = await TradingAsset.findOne({ key: position.asset });
  const exitPrice = asset
    ? (await marketData.resolveTradePrice(asset)).price
    : position.entryPrice; // asset deleted since — treat as a tie rather than crash

  let outcome;
  if (exitPrice === position.entryPrice) outcome = 'tie';
  else if (position.type === 'BUY') outcome = exitPrice > position.entryPrice ? 'win' : 'loss';
  else outcome = exitPrice < position.entryPrice ? 'win' : 'loss';

  const payout = outcome === 'win'
    ? Number((position.amount * (1 + position.payoutPercent / 100)).toFixed(2))
    : outcome === 'tie'
      ? position.amount
      : 0;
  const resultAmount = Number((payout - position.amount).toFixed(2));

  return { exitPrice, outcome, resultAmount, payout };
};

const settleMaturedPositions = async () => {
  const matured = await TradingPosition.find({ status: 'open', closesAt: { $lte: new Date() } });
  for (const position of matured) {
    try {
      const result = position.mode === 'code'
        ? settleCodePosition(position)
        : await settleSelfPosition(position);

      position.status = 'closed';
      position.resultAmount = result.resultAmount;
      position.outcome = result.outcome;
      if (result.exitPrice !== undefined) position.exitPrice = result.exitPrice;
      position.closedAt = new Date();
      await position.save();

      await User.findByIdAndUpdate(position.userId, { $inc: { balance: result.payout } });

      await Transaction.create({
        userId: position.userId,
        type: 'trading',
        amount: result.payout,
        status: 'completed',
        method: position.mode === 'code' ? 'code' : `self-${position.type}`,
        reference: `TRD-SETTLE-${position._id}`
      });
    } catch (err) {
      console.error(`Failed to settle trading position ${position._id}:`, err.message);
    }
  }
};

// Codes past their redemption window stop being usable even if an admin
// forgot to disable them manually.
const expireStaleCodes = async () => {
  await TradingCode.updateMany(
    { status: 'active', endDate: { $lt: new Date() } },
    { $set: { status: 'expired' } }
  );
};

const start = () => {
  // Every minute, not every 15 — self-directed contracts can be as short as
  // 1 minute, and a Deriv-style trade sitting unsettled for 15 minutes
  // defeats the point.
  cron.schedule('* * * * *', () => {
    settleMaturedPositions().catch(err => console.error('Trading settlement job failed:', err.message));
  });
  cron.schedule('*/15 * * * *', () => {
    expireStaleCodes().catch(err => console.error('Trading code expiry job failed:', err.message));
  });
  settleMaturedPositions().catch(err => console.error('Trading settlement job failed:', err.message));
  expireStaleCodes().catch(err => console.error('Trading code expiry job failed:', err.message));
};

module.exports = { start, settleMaturedPositions, expireStaleCodes };
