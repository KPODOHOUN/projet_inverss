const router = require('express').Router();
const auth = require('../middleware/auth');
const requireAmbassador = require('../middleware/ambassador');
const ambassadorController = require('../controllers/ambassadorController');

router.get('/stats', auth, requireAmbassador, ambassadorController.getStats);

module.exports = router;
