const router = require('express').Router();
const auth = require('../middleware/auth');
const kycController = require('../controllers/kycController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.get('/status', auth, kycController.getStatus);
router.post('/upload', auth, upload.fields([{ name: 'idDocument', maxCount: 1 }, { name: 'selfie', maxCount: 1 }]), kycController.upload);

module.exports = router;
