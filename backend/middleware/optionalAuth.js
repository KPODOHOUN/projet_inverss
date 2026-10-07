const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Same token check as auth.js, but never blocks the request — a visitor
// without an account can still use the AI assistant for general questions,
// just without their account context (balance, pending deposits, etc.)
// injected into it. req.user is null, not missing, when there's no valid
// session, so downstream code never has to guess which case it's in.
const optionalAuth = async (req, res, next) => {
  req.user = null;
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.status !== 'suspended') req.user = user;
  } catch (err) {
    // Invalid/expired token on an optional route — proceed as anonymous
    // rather than rejecting, same as having no token at all.
  }
  next();
};

module.exports = optionalAuth;
