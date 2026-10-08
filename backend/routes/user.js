const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const ALLOWED_AVATAR_MIME = ['image/jpeg', 'image/png', 'image/webp'];

// Same ENSURE-DIR-EXISTS fix as kyc.js's upload dir — multer's diskStorage
// never creates its destination, so a fresh deploy (uploads/ is gitignored)
// would 500 on the very first avatar upload without this.
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
});

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_AVATAR_MIME.includes(file.mimetype)) {
      return cb(new Error('Format de fichier non autorisé (image uniquement)'));
    }
    cb(null, true);
  }
});

router.put('/profile', auth, userController.updateProfile);
router.post('/avatar', auth, uploadAvatar.single('avatar'), userController.uploadAvatar);
router.put('/change-password', auth, userController.changePassword);
router.post('/request-email-change', auth, userController.requestEmailChange);
router.post('/confirm-email-change', auth, userController.confirmEmailChange);
router.post('/request-deletion', auth, userController.requestAccountDeletion);
router.post('/cancel-deletion-request', auth, userController.cancelAccountDeletionRequest);
router.get('/deletion-status', auth, userController.getAccountDeletionStatus);

module.exports = router;
