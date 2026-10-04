const speakeasy = require('speakeasy');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const PlatformConfig = require('../models/PlatformConfig');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');
const { computeAccruedEarnings } = require('../utils/investmentEarnings');

// A deposit is a claimed on-chain USDT payment with no blockchain/node
// integration behind it — it sits pending until an admin checks the
// transaction hash against a block explorer and approves it (see
// adminController.approveTransaction), which is what actually credits the
// balance. Requesting one never touches the balance itself.
exports.deposit = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const { txHash, network } = req.body;
    if (!Number.isFinite(amount) || amount <= 0) return error(res, 'Montant invalide');
    if (!txHash?.trim()) return error(res, 'Le hash de la transaction USDT est requis');
    if (req.user.kycStatus !== 'verified') return error(res, 'Vérification KYC requise avant tout dépôt', 403);

    const config = await PlatformConfig.findOne();
    if (!config?.usdtWallets?.length) return error(res, 'Les dépôts ne sont pas encore configurés. Contactez le support.', 503);

    // The user deposited to one of possibly several configured networks —
    // required once more than one exists, so we know which address they
    // actually sent to (matters for the admin verifying against a block
    // explorer later).
    const wallet = config.usdtWallets.find(w => w.network === network);
    if (!wallet) return error(res, 'Réseau de dépôt invalide');

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      method: `usdt-${wallet.network}`,
      proof: txHash.trim()
    });

    success(res, { transaction, message: 'Dépôt soumis, en attente de vérification par un administrateur' }, 201);
  } catch (err) {
    error(res, err.message);
  }
};

const MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL = 5;

exports.getDepositInfo = async (req, res) => {
  try {
    const config = await PlatformConfig.findOne();
    const wallets = config?.usdtWallets || [];
    success(res, {
      wallets,
      configured: wallets.length > 0
    });
  } catch (err) {
    error(res, err.message);
  }
};

// Five numbers, not a dashboard of statistics — a user should be able to
// tell "how's my money doing" in a few seconds: what they put in, what
// that's worth today, what it's earned, and what they can take out.
exports.getBalances = async (req, res) => {
  try {
    const Investment = require('../models/Investment');
    const [activeInvestments, completedInvestments, depositAgg] = await Promise.all([
      Investment.find({ userId: req.user._id, status: 'active' }),
      Investment.find({ userId: req.user._id, status: 'completed' }),
      Transaction.aggregate([
        { $match: { userId: req.user._id, type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const activeAccrued = activeInvestments.reduce((sum, inv) => sum + computeAccruedEarnings(inv), 0);
    const activePrincipal = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const completedPrincipal = completedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const completedEarnings = completedInvestments.reduce((sum, inv) => sum + inv.earnings, 0);

    const totalDeposited = depositAgg[0]?.total || 0;
    const totalInvested = activePrincipal + completedPrincipal;
    const totalEarned = Number((activeAccrued + completedEarnings).toFixed(2));
    const currentValue = Number((req.user.balance + activePrincipal + activeAccrued).toFixed(2));

    success(res, {
      summary: {
        deposited: totalDeposited,
        invested: totalInvested,
        currentValue,
        earned: totalEarned,
        available: req.user.balance
      },
      // Kept for any older screen still reading the previous shape.
      wallets: { investment: activePrincipal + activeAccrued, pending: 0, available: req.user.balance }
    });
  } catch (err) {
    error(res, err.message);
  }
};

const WITHDRAWAL_NETWORKS = ['TRC20', 'ERC20', 'BEP20', 'POLYGON'];

exports.withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const { usdtAddress, network, twoFactorCode } = req.body;
    if (!Number.isFinite(amount) || amount <= 0) return error(res, 'Montant invalide');
    if (!usdtAddress?.trim()) return error(res, 'Adresse de portefeuille USDT requise');
    if (!WITHDRAWAL_NETWORKS.includes(network)) return error(res, 'Réseau invalide');

    const config = await PlatformConfig.findOne();
    const minWithdrawal = config?.minWithdrawal ?? 1;
    const maxWithdrawal = config?.maxWithdrawal ?? 50000;
    const feePct = config?.withdrawalFee ?? 0;

    if (amount < minWithdrawal) return error(res, `Le retrait minimum est de ${minWithdrawal} USD`);
    if (amount > maxWithdrawal) return error(res, `Le retrait maximum est de ${maxWithdrawal} USD`);
    if (req.user.kycStatus !== 'verified') return error(res, 'Vérification KYC requise avant tout retrait', 403);
    if (req.user.balance < amount) return error(res, 'Solde insuffisant');

    // A withdrawal moves real money out — beyond the login session, we
    // reconfirm it's really the account owner acting right now, the same way
    // a bank re-asks for a code before a transfer.
    if (req.user.twoFactorEnabled) {
      if (!twoFactorCode) return error(res, 'Code de vérification à deux facteurs requis', 401, { requires2FA: true });
      const verified = speakeasy.totp.verify({ secret: req.user.twoFactorSecret, encoding: 'base32', token: String(twoFactorCode), window: 1 });
      if (!verified) return error(res, 'Code 2FA invalide', 401, { requires2FA: true });
    }

    // The referral-growth mechanic: a user's very first withdrawal request
    // requires having already brought in a minimum number of people —
    // afterwards this never applies again, since it's a one-time gate.
    const priorWithdrawals = await Transaction.countDocuments({ userId: req.user._id, type: 'withdrawal' });
    if (priorWithdrawals === 0) {
      const referralCount = await Referral.countDocuments({ referrerId: req.user._id });
      if (referralCount < MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL) {
        return error(res, `Vous devez parrainer au moins ${MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL} personnes avant votre premier retrait (${referralCount}/${MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL} actuellement).`, 403, { referralCount, referralRequired: MIN_REFERRALS_BEFORE_FIRST_WITHDRAWAL });
      }
    }

    const fee = Number((amount * (feePct / 100)).toFixed(2));
    const netPayout = Number((amount - fee).toFixed(2));

    // Atomic check-and-reserve: the balance condition is part of the filter,
    // so two concurrent withdrawal requests can't both pass the balance
    // check before either has deducted anything. A rejection refunds it.
    const reserved = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true }
    );
    if (!reserved) return error(res, 'Solde insuffisant');

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: 'withdrawal',
      amount: -amount,
      fee,
      status: 'pending',
      method: `usdt-${network}`,
      proof: usdtAddress.trim()
    });

    try {
      await emailService.sendWithdrawalConfirmation(req.user.email, req.user.firstName, {
        amount: netPayout,
        method: `USDT (${network})`,
        reference: `WTH-${transaction._id}`
      });
    } catch (e) {
      console.error('Withdrawal email failed:', e.message);
    }

    success(res, { transaction, balance: reserved.balance, netPayout, fee, message: 'Withdrawal submitted' });
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
