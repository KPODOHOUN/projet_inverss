const User = require('../models/User');
const Referral = require('../models/Referral');
const Transaction = require('../models/Transaction');
const PlatformConfig = require('../models/PlatformConfig');

// Direct (level 1) referral commission — paid in real USD, straight into the
// referrer's wallet balance, when a referred user's investment becomes
// active. The schema only tracks one referral row per referred user (direct
// referrer), so only level 1 is paid for now.
const payReferralCommission = async (investment) => {
  try {
    const investor = await User.findById(investment.userId);
    if (!investor?.referredBy) return;

    const config = await PlatformConfig.findOne();
    const rate = (config?.referralCommissionRate ?? 10) / 100;
    const commission = Number((investment.amount * rate).toFixed(2));
    if (commission <= 0) return;

    await User.findByIdAndUpdate(investor.referredBy, { $inc: { balance: commission } });
    await Referral.findOneAndUpdate(
      { referredId: investor._id },
      { $inc: { commissionsEarned: commission }, $setOnInsert: { referrerId: investor.referredBy, level: 1 } },
      { upsert: true }
    );
    await Transaction.create({
      userId: investor.referredBy,
      type: 'commission',
      amount: commission,
      status: 'completed',
      method: 'referral'
    });
  } catch (err) {
    console.error('Referral commission payout failed:', err.message);
  }
};

module.exports = { payReferralCommission };
