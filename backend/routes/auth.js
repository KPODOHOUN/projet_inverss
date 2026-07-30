const router = require('express').Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

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
router.get('/google', authController.googleAuth);
router.get('/facebook', authController.facebookAuth);

module.exports = router;
