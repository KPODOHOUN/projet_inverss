const mongoose = require('mongoose');

const emailOTPSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ['email_verification', 'login', '2fa', 'email_change', 'password_reset'], default: 'email_verification' },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

emailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailOTPSchema.index({ userId: 1, purpose: 1 });

module.exports = mongoose.model('EmailOTP', emailOTPSchema);
