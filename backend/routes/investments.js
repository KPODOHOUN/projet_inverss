const router = require('express').Router();
const auth = require('../middleware/auth');
const investmentController = require('../controllers/investmentController');

router.get('/my-investments', auth, investmentController.myInvestments);
router.get('/packs', investmentController.getPacks);
router.post('/calculate', auth, investmentController.calculate);
router.post('/purchase', auth, investmentController.purchase);
router.post('/:id/close', auth, investmentController.closeMyInvestment);

module.exports = router;
