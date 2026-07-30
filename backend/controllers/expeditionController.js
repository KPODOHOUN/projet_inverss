const Referral = require('../models/Referral');
const VIPExpeditionLevel = require('../models/VIPExpeditionLevel');
const { success, error } = require('../utils/response');

exports.getStatus = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrerId: req.user._id });
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.referredId).length;
    const totalRevenue = 0;

    const levels = await VIPExpeditionLevel.find().sort({ 'thresholds.referrals': 1 });
    let currentLevel = null;
    for (const level of levels) {
      if (totalReferrals >= (level.thresholds.referrals || 0) && totalRevenue >= (level.thresholds.revenue || 0)) {
        currentLevel = level;
      }
    }

    success(res, { totalReferrals, activeReferrals, totalRevenue, currentLevel, levels });
  } catch (err) {
    error(res, err.message);
  }
};
