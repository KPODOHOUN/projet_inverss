const Ad = require('../models/Ad');
const { success, error } = require('../utils/response');

exports.getAvailable = async (req, res) => {
  try {
    const ads = await Ad.find({ active: true });
    success(res, { ads, totalNlxEarned: 0 });
  } catch (err) {
    error(res, err.message);
  }
};

exports.completeAd = async (req, res) => {
  try {
    const { adId } = req.body;
    const ad = await Ad.findById(adId);
    if (!ad) return error(res, 'Ad not found', 404);

    ad.views += 1;
    await ad.save();

    req.user.nlxBalance += ad.reward;
    await req.user.save();

    success(res, { reward: ad.reward, nlxBalance: req.user.nlxBalance });
  } catch (err) {
    error(res, err.message);
  }
};
