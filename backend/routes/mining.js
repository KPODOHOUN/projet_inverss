const router = require('express').Router();
const auth = require('../middleware/auth');
const miningController = require('../controllers/miningController');

router.get('/status', auth, miningController.getStatus);
router.post('/tap', auth, miningController.tap);
router.post('/purchase-robot', auth, miningController.purchaseRobot);

module.exports = router;
