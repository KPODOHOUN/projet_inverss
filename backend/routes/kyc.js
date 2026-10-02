const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../middleware/auth');
const kycController = require('../controllers/kycController');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// multer's diskStorage never creates its destination directory — on a fresh
// deploy (uploads/ is gitignored, so a new clone never has it) every upload
// fails with ENOENT. Create it once at startup so this can't happen again
// regardless of environment (local, VPS, container, fresh clone).
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new Error('Format de fichier non autorisé (image ou PDF uniquement)'));
    }
    cb(null, true);
  }
});

router.get('/status', auth, kycController.getStatus);
router.post('/upload', auth, upload.fields([{ name: 'idDocument', maxCount: 1 }, { name: 'selfie', maxCount: 1 }]), kycController.upload);

// Identity documents are personal data — only the owner or staff reviewing
// KYC may fetch them, so this is an authenticated stream, never a static path.
// Ownership vs. staff access is checked inside the controller.
router.get('/document/:kycId/:type', auth, kycController.getDocument);

module.exports = router;
