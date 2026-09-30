const User = require('../models/User');
const InvestmentPack = require('../models/InvestmentPack');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');
const { payReferralCommission } = require('../services/referralCommissions');
const { payAmbassadorCommission } = require('../services/ambassadorCommissions');
const { computeAccruedEarnings } = require('../utils/investmentEarnings');

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
    if (amount < pack.minAmount) return error(res, `Minimum amount is ${pack.minAmount} USD`);
    if (pack.maxAmount && amount > pack.maxAmount) return error(res, `Maximum amount is ${pack.maxAmount} USD`);

    const roiParts = pack.roi.split('-');
    const roi = roiParts.length > 1 ? (parseFloat(roiParts[0]) + parseFloat(roiParts[1])) / 2 : parseFloat(roiParts[0]);
    const estimatedEarnings = amount * (roi / 100);
    const totalReturn = amount + estimatedEarnings;

    success(res, { estimatedEarnings, totalReturn, roi, pack });
  } catch (err) {
    error(res, err.message);
  }
};

// Investing always spends from the available balance — never a direct
// external payment. To get funds into that balance, the user deposits USDT
// first (see walletController.deposit); an admin verifies that deposit
// against the blockchain and credits the balance. By the time someone
// invests, the money is already confirmed and sitting in their account, so
// the purchase itself can settle immediately with no pending/approval step.
exports.purchase = async (req, res) => {
  try {
    const { pack: packKey, amount } = req.body;
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) return error(res, 'Montant invalide');

    const pack = await InvestmentPack.findOne({ key: packKey, active: true });
    if (!pack) return error(res, 'Pack not found', 404);
    if (numAmount < pack.minAmount) return error(res, `Minimum: ${pack.minAmount} USD`);
    if (pack.maxAmount && numAmount > pack.maxAmount) return error(res, `Maximum: ${pack.maxAmount} USD`);

    const roiParts = pack.roi.split('-');
    const roi = roiParts.length > 1 ? (parseFloat(roiParts[0]) + parseFloat(roiParts[1])) / 2 : parseFloat(roiParts[0]);

    const durationMs = pack.durationUnit === 'hours' ? pack.duration * 3600000
      : pack.durationUnit === 'weeks' ? pack.duration * 7 * 86400000
      : pack.duration * 86400000;

    // Atomic check-and-debit in one write: the balance condition is part of
    // the filter, so two concurrent purchase requests can't both read
    // "enough balance" before either has deducted anything (the classic
    // double-spend race a separate read-then-write would allow).
    const debited = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: numAmount } },
      { $inc: { balance: -numAmount } },
      { new: true }
    );
    if (!debited) return error(res, `Solde insuffisant. Votre solde disponible est de ${req.user.balance} USD.`);

    let investment;
    try {
      investment = await Investment.create({
        userId: req.user._id,
        pack: packKey,
        amount: numAmount,
        roi,
        paymentMethod: 'wallet',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + durationMs)
      });
    } catch (createErr) {
      // No multi-document transactions on a standalone MongoDB instance —
      // if creating the investment fails after the balance was already
      // debited, refund it rather than leave the money in limbo.
      await User.updateOne({ _id: req.user._id }, { $inc: { balance: numAmount } });
      throw createErr;
    }

    payReferralCommission(investment).catch(() => {});

    await Transaction.create({
      userId: req.user._id,
      type: 'investment',
      amount: numAmount,
      status: 'completed',
      method: 'wallet',
      reference: `INV-${investment._id}`
    });

    try {
      const roiAmount = numAmount * (roi / 100);
      await emailService.sendInvestmentConfirmation(req.user.email, req.user.firstName, {
        amount: numAmount, pack: packKey, roi, estimatedEarnings: roiAmount, reference: `INV-${investment._id}`
      });
    } catch (e) {
      console.error('Investment confirmation email failed:', e.message);
    }

    success(res, { investment, balance: debited.balance, message: 'Investissement créé' }, 201);
  } catch (err) {
    error(res, err.message);
  }
};

// Lets an investor end their own active investment before maturity and get
// their capital back plus whatever has accrued so far — same payout math as
// the admin's closeInvestment, just self-service and ownership-scoped.
exports.closeMyInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!investment) return error(res, 'Investissement introuvable', 404);
    if (investment.status !== 'active') return error(res, 'Seul un investissement actif peut être clôturé');

    const elapsed = investment.startDate ? Date.now() - investment.startDate : 0;
    const duration = investment.endDate && investment.startDate ? investment.endDate - investment.startDate : 0;
    const fraction = duration > 0 ? Math.min(elapsed / duration, 1) : 1;
    const earnings = Number((investment.amount * (investment.roi / 100) * fraction).toFixed(2));

    investment.status = 'completed';
    investment.endDate = new Date();
    investment.earnings = earnings;
    await investment.save();
    payAmbassadorCommission(investment).catch(() => {});

    const payout = investment.amount + earnings;
    const user = await User.findByIdAndUpdate(investment.userId, { $inc: { balance: payout } }, { new: true });
    await Transaction.create({
      userId: investment.userId,
      type: 'earning',
      amount: payout,
      status: 'completed',
      method: 'wallet',
      reference: `CLOSE-${investment._id}`
    });

    success(res, { investment, payout, balance: user.balance, message: 'Investissement clôturé' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.myInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const withEarnings = investments.map(inv => {
      const obj = inv.toJSON();
      obj.earnings = computeAccruedEarnings(inv);
      return obj;
    });
    const activeInvestments = withEarnings.filter(i => i.status === 'active');
    const totalEarnings = withEarnings.reduce((sum, i) => sum + i.earnings, 0);
    const totalROI = activeInvestments.length > 0
      ? activeInvestments.reduce((sum, i) => sum + i.roi, 0) / activeInvestments.length
      : 0;

    success(res, {
      investments: withEarnings,
      activeInvestments: activeInvestments.length,
      totalROI: totalROI.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2)
    });
  } catch (err) {
    error(res, err.message);
  }
};
