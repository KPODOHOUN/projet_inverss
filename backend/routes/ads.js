const router = require('express').Router();
const auth = require('../middleware/auth');
const adsController = require('../controllers/adsController');

router.get('/available', auth, adsController.getAvailable);
router.post('/complete', auth, adsController.completeAd);

module.exports = router;
