// Single source of truth for values needed by more than one controller —
// prevents the frontend/backend (or two backend controllers) silently
// drifting out of sync the way the withdrawal referral gate once did.
module.exports = {
  MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL: 3
};
