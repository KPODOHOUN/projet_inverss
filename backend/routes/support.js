const router = require('express').Router();
const optionalAuth = require('../middleware/optionalAuth');
const auth = require('../middleware/auth');
const { assistantLimiter } = require('../middleware/rateLimiters');
const supportController = require('../controllers/supportController');

// Works for anonymous visitors too (optionalAuth) — logged-in users get
// their account context folded into the assistant's answers and a saved
// conversation; anonymous visitors just get general FAQ-grounded help.
router.post('/message', assistantLimiter, optionalAuth, supportController.sendMessage);
router.get('/history', auth, supportController.getHistory);

module.exports = router;
