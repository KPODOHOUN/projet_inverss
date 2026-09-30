const router = require('express').Router();
const auth = require('../middleware/auth');
const walletController = require('../controllers/walletController');

router.get('/deposit-info', auth, walletController.getDepositInfo);
router.post('/deposit', auth, walletController.deposit);
router.get('/balances', auth, walletController.getBalances);
router.post('/withdraw', auth, walletController.withdraw);

module.exports = router;
