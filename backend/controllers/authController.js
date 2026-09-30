const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const Referral = require('../models/Referral');
const AmbassadorReferral = require('../models/AmbassadorReferral');
const EmailVerification = require('../models/EmailVerification');
const PasswordReset = require('../models/PasswordReset');
const EmailOTP = require('../models/EmailOTP');
const LoginHistory = require('../models/LoginHistory');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');
const { generateVerificationToken, generateResetToken, hashToken, generateOTP, verifyOTP } = require('../utils/tokens');
const { isValidEmail, isStrongPassword, passwordRequirementsMessage } = require('../utils/validators');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const isDev = process.env.NODE_ENV !== 'production';

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// Returns the OTP when running locally and the email provider couldn't be
// reached (e.g. no verified sending domain yet) — the response surfaces it
// so testing isn't blocked on real mail delivery. Never happens in prod.
const sendVerificationOTP = async (user) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 600000);
  await EmailOTP.create({ userId: user._id, email: user.email, otp, purpose: 'email_verification', expiresAt });
  try {
    await emailService.sendOTPEmail(user.email, user.firstName, otp, 'email_verification');
    return null;
  } catch (emailErr) {
    if (isDev) {
      console.warn(`[dev] Envoi email échoué (${emailErr.message})`);
      console.log(`[dev] Code de vérification pour ${user.email} : ${otp}`);
      return otp;
    }
    throw emailErr;
  }
};

const sendPasswordResetOTP = async (user) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 600000);

  await EmailOTP.updateMany(
    { userId: user._id, purpose: 'password_reset', usedAt: null },
    { usedAt: new Date() }
  );
  await EmailOTP.create({ userId: user._id, email: user.email, otp, purpose: 'password_reset', expiresAt });

  try {
    await emailService.sendOTPEmail(user.email, user.firstName, otp, 'password_reset');
    return null;
  } catch (emailErr) {
    if (isDev) {
      console.warn(`[dev] Envoi email échoué (${emailErr.message})`);
      console.log(`[dev] Code réinitialisation pour ${user.email} : ${otp}`);
      return otp;
    }
    throw emailErr;
  }
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, referralCode } = req.body;

    if (!firstName?.trim() || !lastName?.trim()) return error(res, 'Prénom et nom sont requis');
    if (!isValidEmail(email)) return error(res, 'Adresse email invalide');
    if (!isStrongPassword(password)) return error(res, passwordRequirementsMessage);

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return error(res, 'Cet email est déjà utilisé');

    const user = await User.create({ firstName: firstName.trim(), lastName: lastName.trim(), email, password, phone });

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer && !referrer._id.equals(user._id)) {
        // A code belonging to an Ambassador routes into the entirely
        // separate Ambassador referral/commission system — never mixed
        // with the standard referredBy/Referral bookkeeping.
        if (referrer.role === 'ambassador') {
          user.referredByAmbassador = referrer._id;
          await user.save();
          await AmbassadorReferral.create({ ambassadorId: referrer._id, referredId: user._id });
        } else {
          user.referredBy = referrer._id;
          await user.save();
          await Referral.create({ referrerId: referrer._id, referredId: user._id, level: 1 });
        }
      }
    }

    let devOtp = null;
    try {
      devOtp = await sendVerificationOTP(user);
    } catch (emailErr) {
      console.error('Failed to send verification OTP:', emailErr.message);
    }

    const jwtToken = createToken(user);
    success(res, {
      token: jwtToken,
      user,
      emailVerificationRequired: !user.emailVerified,
      ...(devOtp ? { devOtp } : {})
    }, 201);
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

    const devOtp = await sendVerificationOTP(user);
    success(res, { message: 'Verification code sent', ...(devOtp ? { devOtp } : {}) });
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
    const { email, password, twoFactorCode } = req.body;
    if (!email || !password) return error(res, 'Email et mot de passe requis', 401);

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password +twoFactorSecret');
    if (!user) return error(res, 'Identifiants invalides', 401);
    if (user.status === 'suspended') return error(res, 'Compte suspendu', 403);

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutes = Math.ceil((user.lockUntil - new Date()) / 60000);
      return error(res, `Trop de tentatives échouées. Réessayez dans ${minutes} minute(s)`, 429);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return error(res, 'Identifiants invalides', 401);
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return error(res, 'Code de vérification à deux facteurs requis', 401, { requires2FA: true });
      }
      const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: String(twoFactorCode), window: 1 });
      if (!verified) {
        return error(res, 'Code 2FA invalide', 401, { requires2FA: true });
      }
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
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
    const secret = speakeasy.generateSecret({ name: `IMC (${req.user.email})` });
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
    const genericMsg = 'Si cet email existe, un code de réinitialisation a été envoyé';
    if (!isValidEmail(email)) return success(res, { message: genericMsg });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return success(res, { message: genericMsg });

    const devOtp = await sendPasswordResetOTP(user);
    success(res, { message: genericMsg, ...(devOtp ? { devOtp } : {}) });
  } catch (err) {
    console.error('forgotPassword error:', err.message);
    error(res, 'Impossible d\'envoyer le code. Réessayez dans quelques minutes.', 503);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, otp, email, password } = req.body;
    if (!password) return error(res, 'Mot de passe requis');
    if (!isStrongPassword(password)) return error(res, passwordRequirementsMessage);

    if (otp && email) {
      if (!isValidEmail(email)) return error(res, 'Code invalide ou expiré');

      const user = await User.findOne({ email: String(email).toLowerCase().trim() });
      if (!user) return error(res, 'Code invalide ou expiré');

      const otpRecord = await EmailOTP.findOne({
        userId: user._id,
        purpose: 'password_reset',
        usedAt: null,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (!otpRecord) return error(res, 'Code invalide ou expiré');

      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        otpRecord.usedAt = new Date();
        await otpRecord.save();
        return error(res, 'Trop de tentatives. Demandez un nouveau code.');
      }

      if (!verifyOTP(otpRecord.otp, String(otp))) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return error(res, 'Code invalide');
      }

      user.password = password;
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      otpRecord.usedAt = new Date();
      await otpRecord.save();

      try {
        await emailService.sendPasswordChanged(user.email, user.firstName);
      } catch (e) {
        console.error('Password changed email failed:', e.message);
      }

      return success(res, { message: 'Mot de passe réinitialisé avec succès' });
    }

    if (!token) return error(res, 'Code ou lien requis');

    const tokenHash = hashToken(token);
    const resetRecord = await PasswordReset.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) return error(res, 'Lien invalide ou expiré');

    const user = await User.findById(resetRecord.userId);
    if (!user) return error(res, 'Utilisateur introuvable', 404);

    user.password = password;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    try {
      await emailService.sendPasswordChanged(user.email, user.firstName);
    } catch (e) {
      console.error('Password changed email failed:', e.message);
    }

    success(res, { message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    error(res, err.message);
  }
};

// Reached after passport has verified the Google/Facebook profile and
// resolved (or created) the matching User — issue our own JWT exactly like
// a normal login, then hand the user back to the SPA with it in the URL
// (a redirect can't carry an Authorization header, so this is the one place
// the token briefly appears in a query string before the frontend stores it
// and cleans the URL).
exports.socialCallback = (req, res) => {
  const { frontendUrlFromRequest } = require('../utils/frontendUrl');
  const user = req.user;
  if (!user) {
    return res.redirect(`${frontendUrlFromRequest(req)}/login?error=oauth_missing_token`);
  }
  const token = createToken(user);
  res.redirect(`${frontendUrlFromRequest(req)}/oauth-callback?token=${token}`);
};
