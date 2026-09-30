const User = require('../models/User');
const AmbassadorReferral = require('../models/AmbassadorReferral');
const AmbassadorCommission = require('../models/AmbassadorCommission');
const Transaction = require('../models/Transaction');
const PlatformConfig = require('../models/PlatformConfig');

// Ambassador commission — unlike the standard referral commission (paid once,
// as a % of the invested amount, at investment time), this is paid every
// time a referred user's investment SETTLES with real earnings, as a % of
// those realized earnings. Call this from every place that finalizes
// `investment.earnings` (maturity cron, self-close, admin-close).
const payAmbassadorCommission = async (investment) => {
  try {
    const investor = await User.findById(investment.userId);
    if (!investor?.referredByAmbassador) return;
    if (!investment.earnings || investment.earnings <= 0) return;

    const config = await PlatformConfig.findOne();
    const ratePct = config?.ambassadorCommissionRate ?? 10;
    const commission = Number((investment.earnings * (ratePct / 100)).toFixed(2));
    if (commission <= 0) return;

    await User.findByIdAndUpdate(investor.referredByAmbassador, { $inc: { balance: commission } });
    await AmbassadorReferral.findOneAndUpdate(
      { referredId: investor._id },
      { $inc: { commissionsEarned: commission }, $setOnInsert: { ambassadorId: investor.referredByAmbassador } },
      { upsert: true }
    );
    await AmbassadorCommission.create({
      ambassadorId: investor.referredByAmbassador,
      referredUserId: investor._id,
      investmentId: investment._id,
      sourceEarnings: investment.earnings,
      commissionAmount: commission,
      rate: ratePct
    });
    await Transaction.create({
      userId: investor.referredByAmbassador,
      type: 'commission',
      amount: commission,
      status: 'completed',
      method: 'ambassador',
      reference: `AMB-${investment._id}`
    });
  } catch (err) {
    console.error('Ambassador commission payout failed:', err.message);
  }
};

module.exports = { payAmbassadorCommission };
