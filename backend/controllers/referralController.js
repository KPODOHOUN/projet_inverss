const Referral = require('../models/Referral');
const { success, error } = require('../utils/response');

exports.getStats = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user._id }).populate('referredId', 'firstName lastName status createdAt');
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.referredId && r.referredId.status === 'active').length;
    const totalCommissionsNLX = referrals.reduce((sum, r) => sum + r.commissionsEarned, 0);

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
      totalCommissionsNLX,
      totalCommissionsEUR: totalCommissionsNLX * 0.5,
      referralCode: req.user.referralCode,
      referrals: referralsList
    });
  } catch (err) {
    error(res, err.message);
  }
};
