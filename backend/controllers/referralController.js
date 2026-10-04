const Referral = require('../models/Referral');
const PlatformConfig = require('../models/PlatformConfig');
const { success, error } = require('../utils/response');
const { MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL } = require('../config/constants');

exports.getStats = async (req, res) => {
  try {
    const [referrals, config] = await Promise.all([
      Referral.find({ referrerId: req.user._id }).populate('referredId', 'firstName lastName status createdAt'),
      PlatformConfig.findOne()
    ]);
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.referredId && r.referredId.status === 'active').length;
    const totalCommissionsUSD = referrals.reduce((sum, r) => sum + r.commissionsEarned, 0);

    const referralsList = referrals.map(r => ({
      _id: r._id,
      name: r.referredId ? `${r.referredId.firstName} ${r.referredId.lastName}` : 'Unknown',
      joinedAt: r.createdAt,
      isActive: r.referredId ? r.referredId.status === 'active' : false,
      commissionsEarned: r.commissionsEarned
    }));

    success(res, {
      totalReferrals,
      activeReferrals,
      totalCommissionsUSD,
      commissionRate: config?.referralCommissionRate ?? 10,
      referralCode: req.user.referralCode,
      referrals: referralsList,
      withdrawalReferralRequirement: MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL
    });
  } catch (err) {
    error(res, err.message);
  }
};
