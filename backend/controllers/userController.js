const User = require('../models/User');
const EmailOTP = require('../models/EmailOTP');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');
const { generateOTP, verifyOTP } = require('../utils/tokens');
const { isValidEmail, isStrongPassword, passwordRequirementsMessage } = require('../utils/validators');

const isDev = process.env.NODE_ENV !== 'production';

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { firstName, lastName, phone, updatedAt: new Date() }, { new: true });
    success(res, { user });
  } catch (err) {
    error(res, err.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!isStrongPassword(newPassword)) return error(res, passwordRequirementsMessage);

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return error(res, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    try {
      await emailService.sendPasswordChanged(user.email, user.firstName);
    } catch (e) {
      console.error('Password change email failed:', e.message);
    }

    success(res, { message: 'Password changed' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.requestEmailChange = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) return error(res, 'New email and password are required');

    if (!newEmail.includes('@')) return error(res, 'Invalid email address');

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) return error(res, 'Email already in use');

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, 'Invalid password');

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 600000);

    await EmailOTP.create({
      userId: user._id,
      email: newEmail,
      otp,
      purpose: 'email_change',
      expiresAt
    });

    let devOtp = null;
    try {
      await emailService.sendOTPEmail(newEmail, user.firstName, otp, 'email_change');
    } catch (e) {
      console.error('Email change OTP send failed:', e.message);
      if (isDev) {
        console.log(`[dev] Code de changement d'email pour ${newEmail} : ${otp}`);
        devOtp = otp;
      }
    }

    success(res, { message: 'Verification code sent to new email', ...(devOtp ? { devOtp } : {}) });
  } catch (err) {
    error(res, err.message);
  }
};

exports.confirmEmailChange = async (req, res) => {
  try {
    const { newEmail, otp: providedOtp } = req.body;
    if (!newEmail || !providedOtp) return error(res, 'New email and OTP are required');

    const otpRecord = await EmailOTP.findOne({
      userId: req.user._id,
      email: newEmail,
      purpose: 'email_change',
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

    const oldEmail = req.user.email;
    req.user.email = newEmail;
    await req.user.save();

    otpRecord.usedAt = new Date();
    await otpRecord.save();

    try {
      await emailService.sendEmailChanged(oldEmail, req.user.firstName, newEmail);
    } catch (e) {
      console.error('Email change notification failed:', e.message);
    }

    success(res, { user: req.user, message: 'Email address updated successfully' });
  } catch (err) {
    error(res, err.message);
  }
};
