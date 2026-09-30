const AmbassadorReferral = require('../models/AmbassadorReferral');
const AmbassadorCommission = require('../models/AmbassadorCommission');
const { success, error } = require('../utils/response');

exports.getStats = async (req, res) => {
  try {
    const referrals = await AmbassadorReferral.find({ ambassadorId: req.user._id })
      .populate('referredId', 'firstName lastName createdAt')
      .sort({ createdAt: -1 });

    const totalCommissions = referrals.reduce((sum, r) => sum + r.commissionsEarned, 0);

    const commissionHistory = await AmbassadorCommission.find({ ambassadorId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    success(res, {
      referralCode: req.user.referralCode,
      totalReferred: referrals.length,
      referrals: referrals
        .filter(r => r.referredId) // defensive: skip rows whose referred user was since deleted
        .map(r => ({
          name: `${r.referredId.firstName} ${r.referredId.lastName}`,
          joinedAt: r.referredId.createdAt,
          commissionsEarned: r.commissionsEarned
        })),
      totalCommissions: Number(totalCommissions.toFixed(2)),
      availableBalance: req.user.balance,
      commissionHistory
    });
  } catch (err) { error(res, err.message); }
};
