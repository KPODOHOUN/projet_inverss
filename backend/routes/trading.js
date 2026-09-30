const router = require('express').Router();
const auth = require('../middleware/auth');
const tradingController = require('../controllers/tradingController');

router.get('/assets', auth, tradingController.getAssets);
router.get('/chart/:asset', auth, tradingController.getChart);
router.get('/settings', auth, tradingController.getSettings);
router.post('/redeem', auth, tradingController.redeemCode);
router.post('/open', auth, tradingController.openSelfPosition);
router.get('/positions', auth, tradingController.myPositions);

module.exports = router;
