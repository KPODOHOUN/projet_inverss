const router = require('express').Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const { passport, googleEnabled, facebookEnabled } = require('../config/passport');
const { frontendUrlFromRequest } = require('../utils/frontendUrl');

router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/send-otp', auth, authController.sendOTP);
router.post('/verify-otp', auth, authController.verifyOTPCode);
router.post('/login', authController.login);
router.get('/me', auth, authController.me);
router.post('/logout', auth, authController.logout);
router.post('/2fa/setup', auth, authController.setup2FA);
router.post('/2fa/verify', auth, authController.verify2FA);
router.post('/2fa/disable', auth, authController.disable2FA);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Only registered when the corresponding OAuth credentials are present in
// .env — otherwise redirect to login with a clear "not configured" error
// instead of a 500 from passport.authenticate() on a missing strategy.
if (googleEnabled) {
  // The referral code (if any) is handed off via the OAuth `state` param —
  // the only thing that survives Google's redirect round trip without a
  // server session (auth runs with session: false throughout).
  router.get('/google', (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'], session: false, state: req.query.ref || '' })(req, res, next);
  });
  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        // passport-oauth2's InternalOAuthError hides the actual reason Google
        // gave behind a generic "Bad Request" .message — .oauthError carries
        // Google's real response body (e.g. invalid_grant, redirect_uri
        // mismatch, consent screen in testing mode), which is what actually
        // explains a failure instead of just confirming one happened.
        const detail = err?.oauthError?.data || err?.oauthError || err?.message || err || 'no user returned';
        console.error('Google OAuth callback failed:', detail, req.query.error ? `(provider error: ${req.query.error})` : '');
        return res.redirect(`${frontendUrlFromRequest(req)}/login?error=google_failed`);
      }
      req.user = user;
      authController.socialCallback(req, res);
    })(req, res, next);
  });
} else {
  router.get(['/google', '/google/callback'], (req, res) => {
    res.redirect(`${frontendUrlFromRequest(req)}/login?error=google_not_configured`);
  });
}

if (facebookEnabled) {
  router.get('/facebook', (req, res, next) => {
    passport.authenticate('facebook', { scope: ['email'], session: false, state: req.query.ref || '' })(req, res, next);
  });
  router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, user) => {
      if (err || !user) {
        console.error('Facebook OAuth callback failed:', err?.message || err || 'no user returned');
        return res.redirect(`${frontendUrlFromRequest(req)}/login?error=facebook_failed`);
      }
      req.user = user;
      authController.socialCallback(req, res);
    })(req, res, next);
  });
} else {
  router.get(['/facebook', '/facebook/callback'], (req, res) => {
    res.redirect(`${frontendUrlFromRequest(req)}/login?error=facebook_not_configured`);
  });
}

module.exports = router;
