const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.get('/', auth, ctrl.list);
router.post('/:id/read', auth, ctrl.markRead);
router.post('/read-all', auth, ctrl.markAllRead);

module.exports = router;
