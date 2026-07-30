const router = require('express').Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

router.put('/profile', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);
router.post('/request-email-change', auth, userController.requestEmailChange);
router.post('/confirm-email-change', auth, userController.confirmEmailChange);

module.exports = router;
