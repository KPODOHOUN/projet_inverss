const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['standard', 'vip', 'moderator', 'admin', 'superadmin', 'ambassador'], default: 'standard' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: '', select: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  balance: { type: Number, default: 0 },
  // Human-readable account identifier (e.g. "USR-7F3K9QZ"), separate from
  // the referral code and from Mongo's _id — what support asks a user for
  // to look up their account. sparse: true for the same reason as
  // googleId/facebookId below: existing accounts get it via a one-off
  // migration, not instantly, so a plain unique index would reject the
  // second pre-migration document for "duplicate" missing values.
  userId: { type: String, unique: true, sparse: true, immutable: true },
  country: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Set only when the referral code used at signup belonged to an
  // Ambassador account — kept entirely separate from `referredBy` so the
  // two commission systems (standard referral vs. Ambassador) never mix.
  referredByAmbassador: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // No `default` here on purpose: a sparse unique index only skips documents
  // where the field is entirely absent — a default of `null` would write an
  // explicit null into every document and break uniqueness for everyone
  // after the first user (exactly the bug this comment is here to prevent).
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: { type: Boolean, default: false },
  lastLogin: Date,
  lastLoginIp: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = 'IMC' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (!this.userId) {
    this.userId = 'USR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

// Default sort for the admin user list — without it, paginating a
// million-row collection still means scanning the whole thing to sort it.
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
