const Transaction = require('../models/Transaction');
const PaymentHistory = require('../models/PaymentHistory');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');

exports.getBalances = async (req, res) => {
  try {
    const Investment = require('../models/Investment');
    const activeInvestments = await Investment.find({ userId: req.user._id, status: 'active' });
    const investmentBalance = activeInvestments.reduce((sum, inv) => sum + inv.amount + inv.earnings, 0);
    const weeklyBreakdown = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, networkBonus: 0, multiplier: 0 };
    const paymentHistory = await PaymentHistory.find({ userId: req.user._id }).sort({ weekStart: -1 }).limit(10);

    success(res, {
      wallets: { investment: investmentBalance, pending: 0, available: req.user.balance },
      weeklyBreakdown,
      paymentHistory
    });
  } catch (err) {
    error(res, err.message);
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, method } = req.body;
    if (req.user.balance < amount) return error(res, 'Insufficient balance');

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      method
    });

    try {
      await emailService.sendWithdrawalConfirmation(req.user.email, req.user.firstName, {
        amount,
        method,
        reference: `WTH-${transaction._id}`
      });
    } catch (e) {
      console.error('Withdrawal email failed:', e.message);
    }

    success(res, { transaction, message: 'Withdrawal submitted' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.reinvest = async (req, res) => {
  try {
    const { amount } = req.body;
    if (req.user.balance < amount) return error(res, 'Insufficient balance');

    req.user.balance -= amount;
    await req.user.save();

    await Transaction.create({
      userId: req.user._id,
      type: 'reinvestment',
      amount,
      status: 'completed',
      method: 'wallet'
    });

    success(res, { balance: req.user.balance, message: 'Funds reinvested' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.transactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    success(res, { transactions });
  } catch (err) {
    error(res, err.message);
  }
};
