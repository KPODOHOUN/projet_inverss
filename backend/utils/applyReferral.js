const User = require('../models/User');
const Referral = require('../models/Referral');
const AmbassadorReferral = require('../models/AmbassadorReferral');

// Links a brand-new user to whoever's referral code they signed up with.
// Shared between the standard email/password register flow and social
// sign-up (Google/Facebook) — the latter has its own separate
// user-creation path (config/passport.js) and would otherwise silently
// skip referral attribution entirely, which is exactly what was happening.
const applyReferralCode = async (user, rawCode) => {
  const code = rawCode?.trim();
  if (!code) return;

  const referrer = await User.findOne({ referralCode: code });
  if (!referrer || referrer._id.equals(user._id)) return;

  // A code belonging to an Ambassador routes into the entirely separate
  // Ambassador referral/commission system — never mixed with the standard
  // referredBy/Referral bookkeeping.
  if (referrer.role === 'ambassador') {
    user.referredByAmbassador = referrer._id;
    await user.save();
    await AmbassadorReferral.create({ ambassadorId: referrer._id, referredId: user._id });
  } else {
    user.referredBy = referrer._id;
    await user.save();
    await Referral.create({ referrerId: referrer._id, referredId: user._id, level: 1 });
  }
};

module.exports = { applyReferralCode };
