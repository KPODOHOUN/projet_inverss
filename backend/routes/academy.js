const router = require('express').Router();
const auth = require('../middleware/auth');
const academyController = require('../controllers/academyController');

router.get('/progress', auth, academyController.getProgress);
router.post('/complete', auth, academyController.completeVideo);

module.exports = router;
