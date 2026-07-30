const KYC = require('../models/KYC');
const { success, error } = require('../utils/response');

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
      if (req.files.idDocument) {
        kyc.idDocumentUrl = '/uploads/' + req.files.idDocument[0].filename;
      }
      if (req.files.selfie) {
        kyc.selfieUrl = '/uploads/' + req.files.selfie[0].filename;
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
