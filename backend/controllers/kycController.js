const path = require('path');
const fs = require('fs');
const KYC = require('../models/KYC');
const { success, error } = require('../utils/response');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const STAFF_ROLES = ['admin', 'superadmin', 'moderator'];

exports.getStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user._id });
    success(res, { kyc, kycStatus: req.user.kycStatus });
  } catch (err) {
    error(res, err.message);
  }
};

exports.upload = async (req, res) => {
  try {
    let kyc = await KYC.findOne({ userId: req.user._id });
    if (!kyc) {
      kyc = new KYC({ userId: req.user._id });
    }
    if (req.files) {
      // Store only the filename — the file is served through the authenticated
      // /kyc/document route, never a public URL.
      if (req.files.idDocument) {
        kyc.idDocumentUrl = req.files.idDocument[0].filename;
      }
      if (req.files.selfie) {
        kyc.selfieUrl = req.files.selfie[0].filename;
      }
    }
    kyc.status = 'pending';
    kyc.submittedAt = new Date();
    await kyc.save();

    req.user.kycStatus = 'pending';
    await req.user.save();

    success(res, { kyc, message: 'KYC documents submitted' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.getDocument = async (req, res) => {
  try {
    const { kycId, type } = req.params;
    if (!['idDocument', 'selfie'].includes(type)) return error(res, 'Invalid document type', 400);

    const kyc = await KYC.findById(kycId);
    if (!kyc) return error(res, 'KYC not found', 404);

    const isOwner = String(kyc.userId) === String(req.user._id);
    const isStaff = STAFF_ROLES.includes(req.user.role);
    if (!isOwner && !isStaff) return error(res, 'Accès refusé', 403);

    const filename = type === 'idDocument' ? kyc.idDocumentUrl : kyc.selfieUrl;
    if (!filename) return error(res, 'Document not found', 404);

    // filename is generated server-side (timestamp + random + extname) and
    // never taken from user input, but basename() guards against any
    // legacy/malformed value ever reaching the filesystem path.
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);
    if (!fs.existsSync(filePath)) return error(res, 'Document not found', 404);

    res.sendFile(filePath);
  } catch (err) {
    error(res, err.message);
  }
};
