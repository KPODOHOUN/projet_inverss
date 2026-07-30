const router = require('express').Router();
const auth = require('../middleware/auth');
const walletController = require('../controllers/walletController');

router.get('/balances', auth, walletController.getBalances);
router.post('/withdraw', auth, walletController.withdraw);
router.post('/reinvest', auth, walletController.reinvest);

module.exports = router;
