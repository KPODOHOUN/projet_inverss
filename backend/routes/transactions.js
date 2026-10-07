const router = require('express').Router();
const auth = require('../middleware/auth');
const walletController = require('../controllers/walletController');

router.get('/history', auth, walletController.transactionHistory);
router.put('/:id/hide', auth, walletController.setTransactionHidden);

module.exports = router;
