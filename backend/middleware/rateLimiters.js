const rateLimit = require('express-rate-limit');

// Generous global ceiling — mainly a backstop against runaway clients/bots.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes, veuillez réessayer plus tard' }
});

// Tight limiter for credential-guessing surfaces (login, register, password reset, OTP).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Trop de tentatives, veuillez réessayer dans quelques minutes' }
});

// The AI assistant calls an external API per message — this caps abuse
// independently of Gemini's own free-tier quota (shared across every
// user), so one person spamming the chat can't burn through the whole
// platform's daily allowance.
const assistantLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de messages à l'assistant, réessayez dans un moment" }
});

module.exports = { apiLimiter, authLimiter, assistantLimiter };
