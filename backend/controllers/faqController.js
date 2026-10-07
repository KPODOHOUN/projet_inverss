const FAQ = require('../models/FAQ');
const { success, error } = require('../utils/response');

exports.getPublic = async (req, res) => {
  try {
    const faqs = await FAQ.find({ active: true }).sort({ category: 1, order: 1 });
    success(res, { faqs });
  } catch (err) {
    error(res, err.message);
  }
};
