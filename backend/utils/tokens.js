const crypto = require('crypto');

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

const verifyOTP = (storedOtp, providedOtp) => {
  if (!storedOtp || !providedOtp) return false;
  if (storedOtp.length !== providedOtp.length) return false;
  return crypto.timingSafeEqual(Buffer.from(storedOtp), Buffer.from(providedOtp));
};

const verifyToken = (storedHash, providedToken) => {
  if (!storedHash || !providedToken) return false;
  const providedHash = hashToken(providedToken);
  if (storedHash.length !== providedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(providedHash));
};

module.exports = {
  generateVerificationToken,
  generateResetToken,
  hashToken,
  generateOTP,
  verifyOTP,
  verifyToken
};
