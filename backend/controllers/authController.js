const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral');
const EmailVerification = require('../models/EmailVerification');
const PasswordReset = require('../models/PasswordReset');
const EmailOTP = require('../models/EmailOTP');
const LoginHistory = require('../models/LoginHistory');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');
const { generateVerificationToken, generateResetToken, hashToken, generateOTP, verifyOTP } = require('../utils/tokens');

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, referralCode } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return error(res, 'Email already in use');

    const user = await User.create({ firstName, lastName, email, password, phone });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer._id;
        await user.save();
        await Referral.create({ referrerId: referrer._id, referredId: user._id, level: 1 });
      }
    }

    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 86400000);

    await EmailVerification.create({
      userId: user._id,
      email: user.email,
      token: hashToken(token),
      expiresAt
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    try {
      await emailService.sendVerificationEmail(user.email, user.firstName, verificationLink);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
    }

    const jwtToken = createToken(user);
    success(res, { token: jwtToken, user, emailVerificationRequired: true }, 201);
  } catch (err) {
    error(res, err.message);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return error(res, 'Verification token is required');

    const tokenHash = hashToken(token);
    const verification = await EmailVerification.findOne({
      token: tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) return error(res, 'Invalid or expired verification token');

    const user = await User.findById(verification.userId);
    if (!user) return error(res, 'User not found', 404);
    if (user.emailVerified) return error(res, 'Email already verified');

    user.emailVerified = true;
    await user.save();

    verification.usedAt = new Date();
    await verification.save();

    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (e) {
      console.error(e.message);
    }

    success(res, { user, message: 'Email verified successfully' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const user = req.user;
    if (user.emailVerified) return error(res, 'Email already verified');

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 600000);

    await EmailOTP.create({
      userId: user._id,
      email: user.email,
      otp,
      purpose: 'email_verification',
      expiresAt
    });

    await emailService.sendOTPEmail(user.email, user.firstName, otp, 'email_verification');
    success(res, { message: 'Verification code sent' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.verifyOTPCode = async (req, res) => {
  try {
    const { otp: providedOtp } = req.body;
    const user = req.user;

    if (user.emailVerified) return error(res, 'Email already verified');

    const otpRecord = await EmailOTP.findOne({
      userId: user._id,
      purpose: 'email_verification',
      usedAt: null,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) return error(res, 'No valid OTP found. Request a new one');

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      otpRecord.usedAt = new Date();
      await otpRecord.save();
      return error(res, 'Too many attempts. Request a new code');
    }

    if (!verifyOTP(otpRecord.otp, providedOtp)) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return error(res, 'Invalid verification code');
    }

    user.emailVerified = true;
    await user.save();

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (e) {
      console.error(e.message);
    }

    success(res, { user, message: 'Email verified successfully' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return error(res, 'Invalid credentials', 401);
    if (user.status === 'suspended') return error(res, 'Account suspended', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, 'Invalid credentials', 401);

    user.lastLogin = new Date();
    await user.save();

    try {
      const recentLogins = await LoginHistory.find({ userId: user._id }).sort({ createdAt: -1 }).limit(1);
      const ip = req.ip || req.connection?.remoteAddress || 'Unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      await LoginHistory.create({
        userId: user._id,
        ip,
        userAgent,
        device: userAgent.substring(0, 100),
        location: 'Unknown'
      });

      if (recentLogins.length > 0 && recentLogins[0].ip !== ip) {
        emailService.sendSecurityAlert(user.email, user.firstName, {
          device: userAgent.substring(0, 50),
          ip,
          location: 'Unknown',
          time: new Date().toLocaleString('fr-FR')
        }).catch(e => console.error('Security alert send failed:', e.message));
      }
    } catch (logErr) {
      console.error('Login logging failed:', logErr.message);
    }

    const token = createToken(user);
    success(res, {
      token,
      user,
      emailVerificationRequired: !user.emailVerified
    });
  } catch (err) {
    error(res, err.message);
  }
};

exports.me = async (req, res) => {
  success(res, { user: req.user });
};

exports.logout = (req, res) => {
  success(res, { message: 'Logged out' });
};

exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `NELIAXA (${req.user.email})` });
    req.user.twoFactorSecret = secret.base32;
    await req.user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    success(res, { secret: secret.base32, qrCode });
  } catch (err) {
    error(res, err.message);
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const verified = speakeasy.totp.verify({ secret: req.user.twoFactorSecret, encoding: 'base32', token });
    if (!verified) return error(res, 'Invalid token');

    req.user.twoFactorEnabled = true;
    await req.user.save();
    success(res, { message: '2FA enabled' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, 'Invalid password');

    req.user.twoFactorEnabled = false;
    req.user.twoFactorSecret = '';
    await req.user.save();
    success(res, { message: '2FA disabled' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return success(res, { message: 'If the email exists, a reset link has been sent' });

    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      tokenHash: hashToken(resetToken),
      expiresAt
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await emailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr.message);
    }

    success(res, { message: 'If the email exists, a reset link has been sent' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return error(res, 'Token and password are required');

    const tokenHash = hashToken(token);
    const resetRecord = await PasswordReset.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) return error(res, 'Invalid or expired reset token');

    const user = await User.findById(resetRecord.userId);
    if (!user) return error(res, 'User not found', 404);

    user.password = password;
    await user.save();

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    success(res, { message: 'Password reset successful' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.googleAuth = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
};

exports.facebookAuth = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
};
