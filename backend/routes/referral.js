const router = require('express').Router();
const auth = require('../middleware/auth');
const referralController = require('../controllers/referralController');

router.get('/stats', auth, referralController.getStats);

module.exports = router;
