const router = require('express').Router();
const auth = require('../middleware/auth');
const expeditionController = require('../controllers/expeditionController');

router.get('/status', auth, expeditionController.getStatus);

module.exports = router;
