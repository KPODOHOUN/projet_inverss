const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const emailService = require('./emailService');

// Finalizes investments whose term has ended: credits principal + full
// earnings back to the user's balance and marks the investment completed.
// Without this, matured investments would just sit "active" forever with
// the invested funds never coming back to the user.
const settleMaturedInvestments = async () => {
  const matured = await Investment.find({ status: 'active', endDate: { $lte: new Date() } });
  for (const investment of matured) {
    try {
      const earnings = Number((investment.amount * (investment.roi / 100)).toFixed(2));
      investment.status = 'completed';
      investment.earnings = earnings;
      await investment.save();
      require('./ambassadorCommissions').payAmbassadorCommission(investment).catch(() => {});

      const payout = investment.amount + earnings;
      const user = await User.findByIdAndUpdate(investment.userId, { $inc: { balance: payout } }, { new: true });

      await Transaction.create({
        userId: investment.userId,
        type: 'earning',
        amount: payout,
        status: 'completed',
        method: 'wallet',
        reference: `MATURITY-${investment._id}`
      });

      if (user) {
        emailService.sendInvestmentConfirmation(user.email, user.firstName, {
          amount: investment.amount, pack: investment.pack, roi: investment.roi,
          estimatedEarnings: earnings, reference: `MATURITY-${investment._id}`
        }).catch(() => {});
      }
    } catch (err) {
      console.error(`Failed to settle investment ${investment._id}:`, err.message);
    }
  }
};

const start = () => {
  // Every 15 minutes: cheap enough given the low write volume, frequent
  // enough that a matured investment never sits unsettled for long.
  cron.schedule('*/15 * * * *', () => {
    settleMaturedInvestments().catch(err => console.error('Investment maturity job failed:', err.message));
  });
  // Run once on boot too, so nothing waits a full 15 minutes after a restart.
  settleMaturedInvestments().catch(err => console.error('Investment maturity job failed:', err.message));
};

module.exports = { start, settleMaturedInvestments };
