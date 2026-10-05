const passport = require('passport');
const crypto = require('crypto');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const { applyReferralCode } = require('../utils/applyReferral');

// Social login provisions a real account on first sign-in: since the
// provider already verified the email, we trust it and skip our own OTP
// step. The account still needs a password hash to satisfy the schema —
// the user never sees it, but can set a real one later via "forgot password".
//
// referralCode only applies on the brand-new-account branch below — an
// existing account that merely links a new provider was already attributed
// (or deliberately wasn't) at its original signup, same as the standard
// register flow only ever applies a code at creation time.
const findOrCreateSocialUser = async ({ providerField, providerId, email, firstName, lastName, referralCode }) => {
  let user = await User.findOne({ [providerField]: providerId });
  if (user) return user;

  user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    user[providerField] = providerId;
    if (!user.emailVerified) user.emailVerified = true;
    await user.save();
    return user;
  }

  user = await User.create({
    firstName: firstName || 'Utilisateur',
    lastName: lastName || 'IMC',
    email,
    password: crypto.randomBytes(32).toString('hex'),
    emailVerified: true,
    [providerField]: providerId
  });
  await applyReferralCode(user, referralCode);
  return user;
};

const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const facebookEnabled = !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

if (googleEnabled) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${backendUrl}/api/auth/google/callback`,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('Aucun email fourni par Google'));
      // The referral code rides through Google's redirect dance in the
      // OAuth `state` param — the only thing that survives the round trip
      // without a server session (auth runs with session: false).
      const user = await findOrCreateSocialUser({
        providerField: 'googleId',
        providerId: profile.id,
        email,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        referralCode: req.query.state
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));
} else {
  console.warn('Google OAuth not configured (missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) — /api/auth/google disabled');
}

if (facebookEnabled) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${backendUrl}/api/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name'],
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('Aucun email fourni par Facebook — autorisez le partage d\'email'));
      const user = await findOrCreateSocialUser({
        providerField: 'facebookId',
        providerId: profile.id,
        email,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        referralCode: req.query.state
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }));
} else {
  console.warn('Facebook OAuth not configured (missing FACEBOOK_APP_ID/FACEBOOK_APP_SECRET) — /api/auth/facebook disabled');
}

module.exports = { passport, googleEnabled, facebookEnabled };
