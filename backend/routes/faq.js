const router = require('express').Router();
const faqController = require('../controllers/faqController');

// Public — help content should be reachable without an account, same as
// the landing page itself.
router.get('/', faqController.getPublic);

module.exports = router;
