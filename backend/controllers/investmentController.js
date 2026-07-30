const InvestmentPack = require('../models/InvestmentPack');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');

exports.getPacks = async (req, res) => {
  try {
    const packs = await InvestmentPack.find({ active: true });
    success(res, { packs });
  } catch (err) {
    error(res, err.message);
  }
};

exports.calculate = async (req, res) => {
  try {
    const { pack: packKey, amount } = req.body;
    const pack = await InvestmentPack.findOne({ key: packKey, active: true });
    if (!pack) return error(res, 'Pack not found', 404);
    if (amount < pack.minAmount) return error(res, `Minimum amount is ${pack.minAmount} EUR`);
    if (pack.maxAmount && amount > pack.maxAmount) return error(res, `Maximum amount is ${pack.maxAmount} EUR`);

    const roiParts = pack.roi.split('-');
    const roi = roiParts.length > 1 ? (parseFloat(roiParts[0]) + parseFloat(roiParts[1])) / 2 : parseFloat(roiParts[0]);
    const estimatedEarnings = amount * (roi / 100);
    const totalReturn = amount + estimatedEarnings;

    success(res, { estimatedEarnings, totalReturn, roi, pack });
  } catch (err) {
    error(res, err.message);
  }
};

exports.purchase = async (req, res) => {
  try {
    const { pack: packKey, amount, paymentMethod } = req.body;
    const pack = await InvestmentPack.findOne({ key: packKey, active: true });
    if (!pack) return error(res, 'Pack not found', 404);
    if (amount < pack.minAmount) return error(res, `Minimum: ${pack.minAmount} EUR`);

    const roiParts = pack.roi.split('-');
    const roi = roiParts.length > 1 ? (parseFloat(roiParts[0]) + parseFloat(roiParts[1])) / 2 : parseFloat(roiParts[0]);

    const durationMs = pack.durationUnit === 'hours' ? pack.duration * 3600000
      : pack.durationUnit === 'weeks' ? pack.duration * 7 * 86400000
      : pack.duration * 86400000;

    const investment = await Investment.create({
      userId: req.user._id,
      pack: packKey,
      amount,
      roi,
      paymentMethod,
      endDate: new Date(Date.now() + durationMs)
    });

    await Transaction.create({
      userId: req.user._id,
      type: 'investment',
      amount,
      status: 'completed',
      method: paymentMethod,
      reference: `INV-${investment._id}`
    });

    try {
      const roiAmount = amount * (roi / 100);
      await emailService.sendInvestmentConfirmation(req.user.email, req.user.firstName, {
        amount,
        pack: packKey,
        roi,
        estimatedEarnings: roiAmount,
        reference: `INV-${investment._id}`
      });
    } catch (e) {
      console.error('Investment confirmation email failed:', e.message);
    }

    success(res, { investment, message: 'Investment created' }, 201);
  } catch (err) {
    error(res, err.message);
  }
};

exports.myInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const activeInvestments = investments.filter(i => i.status === 'active');
    const totalEarnings = investments.reduce((sum, i) => sum + i.earnings, 0);
    const totalROI = activeInvestments.length > 0
      ? activeInvestments.reduce((sum, i) => sum + i.roi, 0) / activeInvestments.length
      : 0;

    success(res, {
      investments,
      activeInvestments: activeInvestments.length,
      totalROI: totalROI.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2)
    });
  } catch (err) {
    error(res, err.message);
  }
};
