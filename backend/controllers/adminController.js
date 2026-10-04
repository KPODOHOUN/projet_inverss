const User = require('../models/User');
const KYC = require('../models/KYC');
const Investment = require('../models/Investment');
const InvestmentPack = require('../models/InvestmentPack');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const AmbassadorReferral = require('../models/AmbassadorReferral');
const AmbassadorCommission = require('../models/AmbassadorCommission');
const AcademyVideo = require('../models/AcademyVideo');
const PlatformConfig = require('../models/PlatformConfig');
const ActivityLog = require('../models/ActivityLog');
const BlockedIP = require('../models/BlockedIP');
const { refreshBlockedIpsCache } = require('../middleware/checkBlockedIp');
const TradingAsset = require('../models/TradingAsset');
const TradingCode = require('../models/TradingCode');
const TradingPosition = require('../models/TradingPosition');
const TradingConfig = require('../models/TradingConfig');
const Notification = require('../models/Notification');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');
const { isValidEmail, isStrongPassword, passwordRequirementsMessage } = require('../utils/validators');

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

// Every admin list endpoint funnels through this — without it, an unbounded
// `.find()` on a million-row collection loads the whole thing into memory
// and serializes it into one response, which crashes the server long before
// it reaches the browser.
const parsePagination = (query, defaultLimit = 50, maxLimit = 200) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

// Shared "today / week / month / all" filter used across every admin list
// endpoint — returns a Mongo filter fragment for the given date field, or
// {} for 'all'/unset so callers can just spread it into their query.
const PERIOD_SPAN_MS = { today: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000, month: 30 * 24 * 60 * 60 * 1000 };
const periodFilter = (query, field) => {
  const span = PERIOD_SPAN_MS[query.period];
  return span ? { [field]: { $gte: new Date(Date.now() - span) } } : {};
};

exports.statsOverview = async (req, res) => {
  try {
    const now = new Date();
    const today = startOfDay(now);
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = new Date(thisMonthStart); lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const [
      totalUsers, activeUsers, newUsersToday, totalInvestments, activeInvestments,
      pendingKyc, pendingTransactions, pendingWithdrawals, config
    ] = await Promise.all([
      User.countDocuments(), User.countDocuments({ status: 'active' }),
      User.countDocuments({ createdAt: { $gte: today } }),
      Investment.countDocuments(), Investment.countDocuments({ status: 'active' }),
      KYC.countDocuments({ status: 'pending' }), Transaction.countDocuments({ status: 'pending' }),
      Transaction.countDocuments({ status: 'pending', type: 'withdrawal' }),
      PlatformConfig.findOne()
    ]);

    const totalDeposits = await Transaction.aggregate([{ $match: { type: 'deposit', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalWithdrawals = await Transaction.aggregate([{ $match: { type: 'withdrawal', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    // Total USD currently sitting in every user's wallet, platform-wide —
    // the actual liability/float the platform is holding right now.
    const totalUserBalanceAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);

    const [totalTradingPositions, openTradingPositions, tradingVolumeAgg, tradingPayoutAgg] = await Promise.all([
      TradingPosition.countDocuments(),
      TradingPosition.countDocuments({ status: 'open' }),
      TradingPosition.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      TradingPosition.aggregate([{ $match: { status: 'closed' } }, { $group: { _id: null, total: { $sum: '$resultAmount' } } }])
    ]);

    const investedThisMonth = await Investment.aggregate([{ $match: { createdAt: { $gte: thisMonthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const investedLastMonth = await Investment.aggregate([{ $match: { createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalInvestedAgg = await Investment.aggregate([{ $match: { status: { $in: ['active', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);

    const thisMonthAmt = investedThisMonth[0]?.total || 0;
    const lastMonthAmt = investedLastMonth[0]?.total || 0;
    const totalInvestedChange = lastMonthAmt > 0 ? Number((((thisMonthAmt - lastMonthAmt) / lastMonthAmt) * 100).toFixed(1)) : 0;

    // Platform "revenue" is defined transparently as fees actually collected
    // on completed withdrawals — not a fabricated number.
    const feePct = config?.withdrawalFee ?? 0;
    const revenue = Number((Math.abs(totalWithdrawals[0]?.total || 0) * (feePct / 100)).toFixed(2));

    const packDistributionAgg = await Investment.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      { $group: { _id: '$pack', count: { $sum: 1 } } }
    ]);
    const packTotal = packDistributionAgg.reduce((s, p) => s + p.count, 0) || 1;
    const packDistribution = packDistributionAgg.map(p => ({ pack: p._id, count: p.count, pct: Math.round((p.count / packTotal) * 100) }));

    const signups7d = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today); dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await User.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
      signups7d.push({ label: dayStart.toLocaleDateString('fr-FR', { weekday: 'short' }), value: count });
    }

    success(res, {
      totalUsers, activeUsers, newUsersToday,
      totalInvestments, activeInvestments,
      totalInvested: totalInvestedAgg[0]?.total || 0,
      totalInvestedChange,
      totalUserBalances: Number((totalUserBalanceAgg[0]?.total || 0).toFixed(2)),
      revenue, revenueChange: 0,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: Math.abs(totalWithdrawals[0]?.total || 0),
      pendingKyc, pendingTransactions, pendingWithdrawals,
      trading: {
        totalPositions: totalTradingPositions,
        openPositions: openTradingPositions,
        totalVolume: Number((tradingVolumeAgg[0]?.total || 0).toFixed(2)),
        totalPayout: Number((tradingPayoutAgg[0]?.total || 0).toFixed(2))
      },
      signups7d, packDistribution
    });
  } catch (err) { error(res, err.message); }
};

exports.alerts = async (req, res) => {
  try {
    const [pendingKyc, pendingTx] = await Promise.all([KYC.countDocuments({ status: 'pending' }), Transaction.countDocuments({ status: 'pending' })]);
    const alerts = [];
    if (pendingKyc > 0) alerts.push({ type: 'warning', message: `${pendingKyc} KYC pending review` });
    if (pendingTx > 0) alerts.push({ type: 'info', message: `${pendingTx} transactions pending approval` });
    success(res, { alerts });
  } catch (err) { error(res, err.message); }
};

exports.recentActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(20).populate('admin', 'firstName lastName');
    success(res, { activities: logs });
  } catch (err) { error(res, err.message); }
};

exports.listUsers = async (req, res) => {
  try {
    const filter = { ...periodFilter(req.query, 'createdAt') };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.kycStatus && req.query.kycStatus !== 'all') filter.kycStatus = req.query.kycStatus;
    if (req.query.search?.trim()) {
      const q = req.query.search.trim();
      filter.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    const { page, limit, skip } = parsePagination(req.query);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);
    success(res, { users, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) { error(res, err.message); }
};

const ASSIGNABLE_ROLES = ['standard', 'vip', 'moderator', 'admin', 'superadmin'];
const PRIVILEGED_ROLES = ['moderator', 'admin', 'superadmin'];

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    if (!isValidEmail(email)) return error(res, 'Adresse email invalide');
    if (!isStrongPassword(password)) return error(res, passwordRequirementsMessage);

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return error(res, 'Email already in use');

    let finalRole = 'standard';
    if (role && role !== 'standard') {
      // Only a superadmin may hand out elevated or staff roles at creation time.
      if (PRIVILEGED_ROLES.includes(role) && req.user.role !== 'superadmin') {
        return error(res, 'Seul un superadmin peut créer un compte avec ce rôle', 403);
      }
      if (!ASSIGNABLE_ROLES.includes(role)) return error(res, 'Rôle invalide');
      finalRole = role;
    }

    const user = await User.create({ firstName, lastName, email, password, phone, role: finalRole });
    await ActivityLog.create({ admin: req.user._id, action: 'Création utilisateur', target: user.email, details: `Rôle: ${finalRole}`, level: 'info' });
    success(res, { user }, 201);
  } catch (err) { error(res, err.message); }
};

// ── Ambassador program (superadmin-created accounts, separate from the
// standard referral system — see services/ambassadorCommissions.js) ────────

exports.createAmbassador = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName?.trim() || !lastName?.trim()) return error(res, 'Prénom et nom sont requis');
    if (!isValidEmail(email)) return error(res, 'Adresse email invalide');
    if (!isStrongPassword(password)) return error(res, passwordRequirementsMessage);

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return error(res, 'Email already in use');

    const ambassador = await User.create({
      firstName: firstName.trim(), lastName: lastName.trim(), email, password, phone,
      role: 'ambassador', emailVerified: true // admin-issued credentials, no self-signup email flow to confirm
    });
    await ActivityLog.create({ admin: req.user._id, action: 'Création ambassadeur', target: ambassador.email, level: 'info' });
    success(res, { ambassador }, 201);
  } catch (err) { error(res, err.message); }
};

exports.listAmbassadors = async (req, res) => {
  try {
    const ambassadors = await User.find({ role: 'ambassador' }).sort({ createdAt: -1 });
    const withStats = await Promise.all(ambassadors.map(async (a) => {
      const referrals = await AmbassadorReferral.find({ ambassadorId: a._id });
      const totalCommissions = referrals.reduce((sum, r) => sum + r.commissionsEarned, 0);
      return {
        ...a.toObject(),
        totalReferred: referrals.length,
        totalCommissions: Number(totalCommissions.toFixed(2))
      };
    }));
    success(res, { ambassadors: withStats });
  } catch (err) { error(res, err.message); }
};

exports.getAmbassadorDetail = async (req, res) => {
  try {
    const ambassador = await User.findOne({ _id: req.params.id, role: 'ambassador' });
    if (!ambassador) return error(res, 'Ambassadeur introuvable', 404);

    const referrals = await AmbassadorReferral.find({ ambassadorId: ambassador._id })
      .populate('referredId', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 });
    const commissionHistory = await AmbassadorCommission.find({ ambassadorId: ambassador._id }).sort({ createdAt: -1 });
    const totalCommissions = referrals.reduce((sum, r) => sum + r.commissionsEarned, 0);

    success(res, {
      ambassador,
      totalReferred: referrals.length,
      totalCommissions: Number(totalCommissions.toFixed(2)),
      referrals: referrals.filter(r => r.referredId).map(r => ({
        name: `${r.referredId.firstName} ${r.referredId.lastName}`,
        email: r.referredId.email,
        joinedAt: r.referredId.createdAt,
        commissionsEarned: r.commissionsEarned
      })),
      commissionHistory
    });
  } catch (err) { error(res, err.message); }
};

exports.updateAmbassador = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const ambassador = await User.findOne({ _id: req.params.id, role: 'ambassador' });
    if (!ambassador) return error(res, 'Ambassadeur introuvable', 404);

    if (email && email !== ambassador.email) {
      if (!isValidEmail(email)) return error(res, 'Adresse email invalide');
      const exists = await User.findOne({ email: String(email).toLowerCase().trim(), _id: { $ne: ambassador._id } });
      if (exists) return error(res, 'Email already in use');
      ambassador.email = email;
    }
    if (firstName?.trim()) ambassador.firstName = firstName.trim();
    if (lastName?.trim()) ambassador.lastName = lastName.trim();
    if (phone !== undefined) ambassador.phone = phone;

    await ambassador.save();
    await ActivityLog.create({ admin: req.user._id, action: 'Modification ambassadeur', target: ambassador.email, level: 'info' });
    success(res, { ambassador });
  } catch (err) { error(res, err.message); }
};

exports.resetAmbassadorPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!isStrongPassword(password)) return error(res, passwordRequirementsMessage);

    const ambassador = await User.findOne({ _id: req.params.id, role: 'ambassador' });
    if (!ambassador) return error(res, 'Ambassadeur introuvable', 404);

    ambassador.password = password; // re-hashed by the User pre('save') hook
    await ambassador.save();
    await ActivityLog.create({ admin: req.user._id, action: 'Réinitialisation mot de passe ambassadeur', target: ambassador.email, level: 'warning' });
    success(res, { message: 'Mot de passe réinitialisé' });
  } catch (err) { error(res, err.message); }
};

exports.suspendUser = async (req, res) => {
  try {
    if (req.params.userId === String(req.user._id)) return error(res, 'Vous ne pouvez pas suspendre votre propre compte');
    const target = await User.findById(req.params.userId);
    if (!target) return error(res, 'User not found', 404);
    if (PRIVILEGED_ROLES.includes(target.role) && req.user.role !== 'superadmin') {
      return error(res, 'Seul un superadmin peut suspendre un compte administrateur', 403);
    }
    target.status = 'suspended';
    await target.save();
    await ActivityLog.create({ admin: req.user._id, action: 'Utilisateur suspendu', target: target.email, level: 'warning' });
    success(res, { user: target, message: 'User suspended' });
  } catch (err) { error(res, err.message); }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'active' }, { new: true });
    if (!user) return error(res, 'User not found', 404);
    await ActivityLog.create({ admin: req.user._id, action: 'Utilisateur réactivé', target: user.email, level: 'info' });
    success(res, { user, message: 'User activated' });
  } catch (err) { error(res, err.message); }
};

exports.adjustBalance = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const { note } = req.body;
    if (!Number.isFinite(amount) || amount === 0) return error(res, 'Montant invalide');
    if (!note?.trim()) return error(res, 'Une raison est requise');

    const user = await User.findById(req.params.userId);
    if (!user) return error(res, 'User not found', 404);
    user.balance = Math.max(0, user.balance + amount);
    await user.save();
    await ActivityLog.create({ admin: req.user._id, action: 'Ajustement de solde', target: user.email, details: `Montant: ${amount} USD - ${note}`, level: 'warning' });
    success(res, { user, message: 'Balance adjusted' });
  } catch (err) { error(res, err.message); }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!ASSIGNABLE_ROLES.includes(role)) return error(res, 'Rôle invalide');
    if (req.params.userId === String(req.user._id)) return error(res, 'Vous ne pouvez pas modifier votre propre rôle');

    // Only a superadmin may grant or revoke privileged roles — otherwise a
    // moderator (who already has access to this endpoint) could promote
    // themselves or anyone else straight to superadmin.
    const target = await User.findById(req.params.userId);
    if (!target) return error(res, 'User not found', 404);
    if ((PRIVILEGED_ROLES.includes(role) || PRIVILEGED_ROLES.includes(target.role)) && req.user.role !== 'superadmin') {
      return error(res, 'Seul un superadmin peut modifier ce rôle', 403);
    }

    target.role = role;
    await target.save();
    await ActivityLog.create({ admin: req.user._id, action: 'Changement de rôle', target: target.email, details: `Nouveau rôle: ${role}`, level: 'warning' });
    success(res, { user: target });
  } catch (err) { error(res, err.message); }
};

exports.listKyc = async (req, res) => {
  try {
    const filter = { ...periodFilter(req.query, 'submittedAt') };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    const kycs = await KYC.find(filter).populate('userId', 'firstName lastName email').sort({ submittedAt: -1 });
    success(res, { kycs });
  } catch (err) { error(res, err.message); }
};

exports.approveKyc = async (req, res) => {
  try {
    const kyc = await KYC.findByIdAndUpdate(req.params.kycId, { status: 'verified', reviewedAt: new Date(), reviewedBy: req.user._id }, { new: true });
    if (!kyc) return error(res, 'KYC not found', 404);
    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'verified' });
    success(res, { kyc, message: 'KYC approved' });
  } catch (err) { error(res, err.message); }
};

exports.rejectKyc = async (req, res) => {
  try {
    const { reason } = req.body;
    const kyc = await KYC.findByIdAndUpdate(req.params.kycId, { status: 'rejected', rejectionReason: reason, reviewedAt: new Date(), reviewedBy: req.user._id }, { new: true });
    if (!kyc) return error(res, 'KYC not found', 404);
    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'rejected' });
    success(res, { kyc, message: 'KYC rejected' });
  } catch (err) { error(res, err.message); }
};

exports.referralStats = async (req, res) => {
  try {
    const [totalReferrals, totalCommissions, config, topAffiliatesAgg] = await Promise.all([
      Referral.countDocuments(),
      Referral.aggregate([{ $group: { _id: null, total: { $sum: '$commissionsEarned' } } }]),
      PlatformConfig.findOne(),
      Referral.aggregate([
        { $group: { _id: '$referrerId', referrals: { $sum: 1 }, commissions: { $sum: '$commissionsEarned' } } },
        { $sort: { referrals: -1 } },
        { $limit: 10 }
      ])
    ]);

    const topAffiliateIds = topAffiliatesAgg.map(a => a._id);
    const affiliateUsers = await User.find({ _id: { $in: topAffiliateIds } }).select('firstName lastName email');
    const usersById = Object.fromEntries(affiliateUsers.map(u => [String(u._id), u]));
    const topAffiliates = topAffiliatesAgg.map(a => ({
      name: usersById[String(a._id)] ? `${usersById[String(a._id)].firstName} ${usersById[String(a._id)].lastName}` : 'Utilisateur supprimé',
      referrals: a.referrals,
      commissions: a.commissions
    }));

    success(res, {
      totalReferrals,
      totalCommissions: totalCommissions[0]?.total || 0,
      commissionRate: config?.referralCommissionRate ?? 10,
      topAffiliates
    });
  } catch (err) { error(res, err.message); }
};

exports.updateCommissionRates = async (req, res) => {
  try {
    // Only level-1 (direct referrer) commissions are actually paid out today,
    // so that's the only rate persisted here.
    const rate = Number(req.body.rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) return error(res, 'Taux invalide (0-100)');
    const config = await PlatformConfig.findOneAndUpdate({}, { referralCommissionRate: rate }, { upsert: true, new: true });
    success(res, { rate: config.referralCommissionRate, message: 'Commission rate updated' });
  } catch (err) { error(res, err.message); }
};

exports.listInvestments = async (req, res) => {
  try {
    const filter = { ...periodFilter(req.query, 'createdAt') };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.pack && req.query.pack !== 'all') filter.pack = req.query.pack;
    const { page, limit, skip } = parsePagination(req.query);
    const [investments, total] = await Promise.all([
      Investment.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Investment.countDocuments(filter)
    ]);
    success(res, { investments, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) { error(res, err.message); }
};

exports.updatePacksConfig = async (req, res) => {
  try {
    const { packs } = req.body;
    for (const pack of packs) {
      if (!pack.key) continue;
      // $set (not a plain object) so this merges fields in place — a plain
      // object here would make MongoDB replace the *whole* document,
      // silently wiping out any field the caller didn't include.
      await InvestmentPack.findOneAndUpdate({ key: pack.key }, { $set: pack }, { upsert: true });
    }
    success(res, { message: 'Packs updated' });
  } catch (err) { error(res, err.message); }
};

exports.closeInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) return error(res, 'Investment not found', 404);
    if (investment.status !== 'active') return error(res, 'Seul un investissement actif peut être clôturé');

    // Closing early pays out the principal plus earnings accrued so far —
    // otherwise the invested funds would simply vanish from the platform.
    const total = investment.startDate ? Date.now() - investment.startDate : 0;
    const duration = investment.endDate && investment.startDate ? investment.endDate - investment.startDate : 0;
    const fraction = duration > 0 ? Math.min(total / duration, 1) : 1;
    const earnings = Number((investment.amount * (investment.roi / 100) * fraction).toFixed(2));

    investment.status = 'completed';
    investment.endDate = new Date();
    investment.earnings = earnings;
    await investment.save();
    require('../services/ambassadorCommissions').payAmbassadorCommission(investment).catch(() => {});

    const payout = investment.amount + earnings;
    await User.findByIdAndUpdate(investment.userId, { $inc: { balance: payout } });
    await Transaction.create({ userId: investment.userId, type: 'earning', amount: payout, status: 'completed', method: 'wallet', reference: `CLOSE-${investment._id}` });
    await ActivityLog.create({ admin: req.user._id, action: 'Investissement clôturé', target: String(investment.userId), details: `Payout: ${payout} USD`, level: 'info' });

    success(res, { investment, payout });
  } catch (err) { error(res, err.message); }
};

exports.listTransactions = async (req, res) => {
  try {
    const filter = { ...periodFilter(req.query, 'createdAt') };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.type && req.query.type !== 'all') filter.type = req.query.type;
    const { page, limit, skip } = parsePagination(req.query);
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter)
    ]);
    success(res, { transactions, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) { error(res, err.message); }
};

// Deposits are a one-step verification (check the tx hash, done) so approve
// takes them straight to 'completed'. Withdrawals get a real multi-step
// trail — pending -> approved -> processing -> completed — because there's
// a genuine gap in time between "an admin signed off on this" and "the USDT
// actually left the platform"; each step is its own audited action instead
// of one click silently standing in for the whole payout process.
exports.approveTransaction = async (req, res) => {
  try {
    const existing = await Transaction.findById(req.params.txId);
    if (!existing) return error(res, 'Transaction not found', 404);

    // Atomic status flip, guarded by the current status — if two admin
    // clicks (or two tabs) race on the same transaction, only the first
    // one actually transitions it; the second gets "already processed"
    // instead of both going on to credit the balance below.
    const newStatus = existing.type === 'withdrawal' ? 'approved' : 'completed';
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.txId, status: 'pending' },
      { status: newStatus, updatedAt: new Date() },
      { new: true }
    );
    if (!txn) return error(res, 'Transaction already processed');

    // A deposit never touched the balance at request time (unlike a
    // withdrawal, which reserves it upfront) — approving is what actually
    // credits it, once the admin has checked the tx hash on-chain.
    if (txn.type === 'deposit') {
      await User.findByIdAndUpdate(txn.userId, { $inc: { balance: txn.amount } });
    }

    if (txn.type === 'investment' && txn.reference?.startsWith('INV-')) {
      const investmentId = txn.reference.replace('INV-', '');
      const investment = await Investment.findById(investmentId);
      if (investment && investment.status === 'pending') {
        const durationMs = investment.endDate && investment.startDate
          ? investment.endDate - investment.startDate
          : 0;
        investment.status = 'active';
        investment.startDate = new Date();
        investment.endDate = new Date(Date.now() + (durationMs > 0 ? durationMs : 0));
        await investment.save();
        require('../services/referralCommissions').payReferralCommission(investment).catch(() => {});
      }
    }

    await ActivityLog.create({ admin: req.user._id, action: 'Transaction approuvée', target: String(txn.userId), details: `${txn.type} - ${Math.abs(txn.amount)} USD`, level: 'info' });
    success(res, { transaction: txn, message: 'Transaction approved' });
  } catch (err) { error(res, err.message); }
};

// Withdrawal-only: the admin has started actually sending the USDT.
exports.processTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.txId);
    if (!txn) return error(res, 'Transaction not found', 404);
    if (txn.type !== 'withdrawal') return error(res, 'Seuls les retraits ont une étape "en traitement"');
    if (txn.status !== 'approved') return error(res, 'Le retrait doit être approuvé avant d\'être mis en traitement');

    txn.status = 'processing';
    txn.updatedAt = new Date();
    await txn.save();

    await ActivityLog.create({ admin: req.user._id, action: 'Retrait mis en traitement', target: String(txn.userId), details: `${Math.abs(txn.amount)} USD`, level: 'info' });
    success(res, { transaction: txn, message: 'Retrait en traitement' });
  } catch (err) { error(res, err.message); }
};

// Withdrawal-only: the payout has actually been sent — this is the final,
// irreversible state. Nothing about a completed transaction can be edited
// silently after this; only a fresh admin action creates a new audit entry.
exports.completeTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.txId);
    if (!txn) return error(res, 'Transaction not found', 404);
    if (txn.type !== 'withdrawal') return error(res, 'Cette action concerne uniquement les retraits');
    if (!['approved', 'processing'].includes(txn.status)) return error(res, 'Ce retrait n\'est pas prêt à être marqué terminé');

    txn.status = 'completed';
    txn.updatedAt = new Date();
    await txn.save();

    await ActivityLog.create({ admin: req.user._id, action: 'Retrait marqué terminé', target: String(txn.userId), details: `${Math.abs(txn.amount)} USD`, level: 'info' });
    success(res, { transaction: txn, message: 'Retrait terminé' });
  } catch (err) { error(res, err.message); }
};

exports.rejectTransaction = async (req, res) => {
  try {
    const { reason } = req.body;
    const existing = await Transaction.findById(req.params.txId);
    if (!existing) return error(res, 'Transaction not found', 404);

    // Same atomic guard as approve — a withdrawal reject refunds the
    // balance below, so a race here would double-credit the user.
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.txId, status: { $in: ['pending', 'approved'] } },
      { status: 'rejected', rejectionReason: reason, updatedAt: new Date() },
      { new: true }
    );
    if (!txn) return error(res, 'Transaction already processed');

    // A rejected deposit never credited anything (see approve, above) — just
    // marking it rejected above is the whole job, nothing to undo here.
    // A rejected withdrawal refunds the balance that was reserved on request.
    if (txn.type === 'withdrawal') {
      await User.findByIdAndUpdate(txn.userId, { $inc: { balance: Math.abs(txn.amount) } });
    }
    // A rejected investment claim never activated, and never touched the
    // balance (external payment methods only) — just cancel the record.
    if (txn.type === 'investment' && txn.reference?.startsWith('INV-')) {
      const investmentId = txn.reference.replace('INV-', '');
      await Investment.findOneAndUpdate({ _id: investmentId, status: 'pending' }, { status: 'cancelled' });
    }

    await ActivityLog.create({ admin: req.user._id, action: 'Transaction rejetée', target: String(txn.userId), details: `${txn.type} - ${reason || ''}`, level: 'warning' });
    success(res, { transaction: txn, message: 'Transaction rejected' });
  } catch (err) { error(res, err.message); }
};

// Distinct from "rejected": a cancellation is the platform/user backing out
// of an otherwise-valid request (e.g. changed their mind, duplicate
// submission) rather than the admin refusing it for cause. Same refund
// mechanics as reject, different audit trail and status.
exports.cancelTransaction = async (req, res) => {
  try {
    const { reason } = req.body;
    const existing = await Transaction.findById(req.params.txId);
    if (!existing) return error(res, 'Transaction not found', 404);

    // Same atomic guard — a withdrawal cancel also refunds the balance.
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.txId, status: { $in: ['pending', 'approved', 'processing'] } },
      { status: 'cancelled', rejectionReason: reason || '', updatedAt: new Date() },
      { new: true }
    );
    if (!txn) return error(res, 'Transaction already processed');

    if (txn.type === 'withdrawal') {
      await User.findByIdAndUpdate(txn.userId, { $inc: { balance: Math.abs(txn.amount) } });
    }
    if (txn.type === 'investment' && txn.reference?.startsWith('INV-')) {
      const investmentId = txn.reference.replace('INV-', '');
      await Investment.findOneAndUpdate({ _id: investmentId, status: 'pending' }, { status: 'cancelled' });
    }

    await ActivityLog.create({ admin: req.user._id, action: 'Transaction annulée', target: String(txn.userId), details: `${txn.type} - ${reason || ''}`, level: 'warning' });
    success(res, { transaction: txn, message: 'Transaction cancelled' });
  } catch (err) { error(res, err.message); }
};

exports.listCourses = async (req, res) => {
  try {
    const AcademyProgress = require('../models/AcademyProgress');
    const courses = await AcademyVideo.find().sort({ level: 1 });
    const completionCounts = await AcademyProgress.aggregate([
      { $unwind: '$completedVideos' },
      { $group: { _id: '$completedVideos', count: { $sum: 1 } } }
    ]);
    const countsById = Object.fromEntries(completionCounts.map(c => [String(c._id), c.count]));
    const withCompletions = courses.map(c => {
      const obj = c.toJSON();
      obj.completions = countsById[String(c._id)] || 0;
      return obj;
    });
    success(res, { courses: withCompletions });
  } catch (err) { error(res, err.message); }
};

exports.createCourse = async (req, res) => {
  try {
    const course = await AcademyVideo.create(req.body);
    success(res, { course }, 201);
  } catch (err) { error(res, err.message); }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await AcademyVideo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return error(res, 'Course not found', 404);
    success(res, { course });
  } catch (err) { error(res, err.message); }
};

exports.getConfig = async (req, res) => {
  try {
    let config = await PlatformConfig.findOne();
    if (!config) config = await PlatformConfig.create({});
    success(res, { config });
  } catch (err) { error(res, err.message); }
};

exports.saveConfig = async (req, res) => {
  try {
    // $set (not a plain object) so a form that only sends some fields merges
    // them in instead of MongoDB replacing the whole document and wiping
    // out every field the caller didn't include.
    const config = await PlatformConfig.findOneAndUpdate({}, { $set: req.body }, { upsert: true, new: true });
    success(res, { config });
  } catch (err) { error(res, err.message); }
};

exports.blockedIps = async (req, res) => {
  try {
    const ips = await BlockedIP.find().sort({ blockedAt: -1 });
    success(res, { blockedIps: ips });
  } catch (err) { error(res, err.message); }
};

exports.blockIp = async (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip?.trim()) return error(res, 'Adresse IP requise');
    // Blocking is enforced before routing even resolves — blocking your own
    // IP would lock every admin (including you) out of the panel with no
    // way back in except direct database access.
    if (ip.trim() === req.ip) return error(res, 'Vous ne pouvez pas bloquer votre propre adresse IP');
    const blocked = await BlockedIP.create({ ip: ip.trim(), reason });
    await refreshBlockedIpsCache();
    success(res, { blockedIp: blocked }, 201);
  } catch (err) { error(res, err.message); }
};

exports.unblockIp = async (req, res) => {
  try {
    await BlockedIP.findOneAndDelete({ ip: req.params.ip });
    await refreshBlockedIpsCache();
    success(res, { message: 'IP unblocked' });
  } catch (err) { error(res, err.message); }
};

const periodStart = (period) => {
  const now = new Date();
  const start = new Date(now);
  if (period === 'week') start.setDate(now.getDate() - 7);
  else if (period === 'quarter') start.setMonth(now.getMonth() - 3);
  else if (period === 'year') start.setFullYear(now.getFullYear() - 1);
  else start.setMonth(now.getMonth() - 1); // month (default)
  return start;
};

const toCsv = (rows) => rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

exports.generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const period = req.query.period || 'month';
    const since = periodStart(period);
    let rows = [];

    if (type === 'financial') {
      const txns = await Transaction.find({ createdAt: { $gte: since } }).populate('userId', 'email').sort({ createdAt: -1 });
      rows = [['Date', 'Utilisateur', 'Type', 'Montant USD', 'Frais', 'Statut'], ...txns.map(t => [t.createdAt.toISOString(), t.userId?.email || '', t.type, t.amount, t.fee || 0, t.status])];
    } else if (type === 'users') {
      const users = await User.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 });
      rows = [['Date inscription', 'Email', 'Rôle', 'Statut', 'KYC', 'Solde USD'], ...users.map(u => [u.createdAt.toISOString(), u.email, u.role, u.status, u.kycStatus, u.balance])];
    } else if (type === 'investments') {
      const invs = await Investment.find({ createdAt: { $gte: since } }).populate('userId', 'email').sort({ createdAt: -1 });
      rows = [['Date', 'Utilisateur', 'Pack', 'Montant USD', 'ROI %', 'Gains USD', 'Statut'], ...invs.map(i => [i.createdAt.toISOString(), i.userId?.email || '', i.pack, i.amount, i.roi, i.earnings, i.status])];
    } else if (type === 'kyc') {
      const kycs = await KYC.find({ submittedAt: { $gte: since } }).populate('userId', 'email').sort({ submittedAt: -1 });
      rows = [['Date soumission', 'Utilisateur', 'Statut', 'Motif rejet'], ...kycs.map(k => [k.submittedAt.toISOString(), k.userId?.email || '', k.status, k.rejectionReason || ''])];
    } else if (type === 'referrals') {
      const refs = await Referral.find({ createdAt: { $gte: since } }).populate('referrerId referredId', 'email').sort({ createdAt: -1 });
      rows = [['Date', 'Parrain', 'Filleul', 'Commissions USD'], ...refs.map(r => [r.createdAt.toISOString(), r.referrerId?.email || '', r.referredId?.email || '', r.commissionsEarned || 0])];
    } else {
      return error(res, 'Unknown report type', 404);
    }

    const csv = toCsv(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="imc_${type}_${period}.csv"`);
    res.send(csv);
  } catch (err) {
    error(res, err.message);
  }
};

exports.listActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(200).populate('admin', 'firstName lastName email');
    success(res, { activities: logs });
  } catch (err) { error(res, err.message); }
};

// ── Trading / simulation engine ──────────────────────────────────────────

exports.listTradingAssets = async (req, res) => {
  try {
    const assets = await TradingAsset.find().sort({ createdAt: 1 });
    success(res, { assets });
  } catch (err) { error(res, err.message); }
};

exports.createTradingAsset = async (req, res) => {
  try {
    const { key, name, category, symbol, basePrice, priceSource, externalProvider, externalId } = req.body;
    if (!key || !name || !Number.isFinite(Number(basePrice))) return error(res, 'Clé, nom et prix de référence requis');
    if (priceSource === 'live' && (!externalProvider || !externalId)) {
      return error(res, 'Un fournisseur et un identifiant externe sont requis pour une source de données réelle');
    }
    const asset = await TradingAsset.create({
      key: key.toLowerCase().trim(), name, category, symbol, basePrice: Number(basePrice),
      priceSource: priceSource === 'live' ? 'live' : 'simulated',
      externalProvider: priceSource === 'live' ? externalProvider : null,
      externalId: priceSource === 'live' ? externalId : ''
    });
    await ActivityLog.create({ admin: req.user._id, action: 'Actif de trading créé', target: asset.key, details: name, level: 'info' });
    success(res, { asset }, 201);
  } catch (err) { error(res, err.message); }
};

exports.updateTradingAsset = async (req, res) => {
  try {
    const asset = await TradingAsset.findOneAndUpdate({ key: req.params.key }, { $set: req.body }, { new: true });
    if (!asset) return error(res, 'Asset not found', 404);
    await ActivityLog.create({ admin: req.user._id, action: 'Actif de trading modifié', target: asset.key, details: JSON.stringify(req.body), level: 'info' });
    success(res, { asset });
  } catch (err) { error(res, err.message); }
};

exports.listTradingCodes = async (req, res) => {
  try {
    const codes = await TradingCode.find().sort({ createdAt: -1 }).populate('assignedUserId', 'firstName lastName email');
    success(res, { codes });
  } catch (err) { error(res, err.message); }
};

const randomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

exports.createTradingCode = async (req, res) => {
  try {
    const { asset, durationHours, variationPercent, startDate, endDate, maxUses, assignedUserId } = req.body;
    if (!asset) return error(res, 'Actif requis');
    if (!Number.isFinite(Number(durationHours)) || Number(durationHours) <= 0) return error(res, 'Durée invalide');
    if (!Number.isFinite(Number(variationPercent))) return error(res, 'Variation invalide');
    if (!startDate || !endDate) return error(res, 'Dates de début et de fin requises');

    const assetDoc = await TradingAsset.findOne({ key: asset });
    if (!assetDoc) return error(res, 'Actif introuvable', 404);

    const code = await TradingCode.create({
      code: randomCode(),
      asset, durationHours: Number(durationHours), variationPercent: Number(variationPercent),
      startDate: new Date(startDate), endDate: new Date(endDate),
      maxUses: Number(maxUses) || 1,
      assignedUserId: assignedUserId || null,
      status: 'active',
      createdBy: req.user._id
    });

    await ActivityLog.create({
      admin: req.user._id, action: 'Code de trading créé', target: code.code,
      details: `${asset} ${variationPercent}% / ${durationHours}h`, level: 'info'
    });

    // Surface the code as an in-app notification instead of leaving it
    // sitting in this admin list where a user would never see it — assigned
    // codes reach just that user, open codes reach every regular user.
    const notifTitle = 'Nouveau code de trading disponible';
    const notifMessage = `Code ${code.code} — ${assetDoc.name} ${Number(variationPercent) >= 0 ? '+' : ''}${variationPercent}% sur ${durationHours}h`;
    const notifData = { code: code.code, asset, variationPercent: Number(variationPercent), durationHours: Number(durationHours), tradingCodeId: code._id };

    if (assignedUserId) {
      await Notification.create({ userId: assignedUserId, type: 'trading_code', title: notifTitle, message: notifMessage, data: notifData });
    } else {
      const recipients = await User.find({ role: { $in: ['standard', 'vip'] }, status: 'active' }).select('_id');
      if (recipients.length > 0) {
        await Notification.insertMany(recipients.map(u => ({
          userId: u._id, type: 'trading_code', title: notifTitle, message: notifMessage, data: notifData
        })));
      }
    }

    success(res, { code }, 201);
  } catch (err) { error(res, err.message); }
};

// Only the status can change after creation, and never once a code has been
// redeemed — a scenario someone already traded against can't be quietly
// rewritten. Disabling an unredeemed code (e.g. created by mistake) is still
// fine since it never affected anyone's balance.
exports.updateTradingCodeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) return error(res, 'Statut invalide');

    const code = await TradingCode.findById(req.params.id);
    if (!code) return error(res, 'Code not found', 404);
    if (code.redemptions.length > 0) return error(res, 'Ce code a déjà été utilisé et ne peut plus être modifié');

    code.status = status;
    await code.save();
    await ActivityLog.create({ admin: req.user._id, action: `Code de trading ${status === 'active' ? 'réactivé' : 'désactivé'}`, target: code.code, details: '', level: 'warning' });
    success(res, { code });
  } catch (err) { error(res, err.message); }
};

exports.listTradingPositions = async (req, res) => {
  try {
    const filter = { ...periodFilter(req.query, 'openedAt') };
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.mode && req.query.mode !== 'all') filter.mode = req.query.mode;
    const { page, limit, skip } = parsePagination(req.query);
    const [positions, total] = await Promise.all([
      TradingPosition.find(filter).populate('userId', 'firstName lastName email').sort({ openedAt: -1 }).skip(skip).limit(limit),
      TradingPosition.countDocuments(filter)
    ]);
    success(res, { positions, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) { error(res, err.message); }
};

exports.getTradingSettings = async (req, res) => {
  try {
    let config = await TradingConfig.findOne();
    if (!config) config = await TradingConfig.create({});
    success(res, { config });
  } catch (err) { error(res, err.message); }
};

exports.saveTradingSettings = async (req, res) => {
  try {
    const { payoutPercent, durationsMinutes } = req.body;
    if (!Number.isFinite(Number(payoutPercent)) || Number(payoutPercent) < 0) return error(res, 'Taux de gain invalide');
    const durations = Array.isArray(durationsMinutes) ? durationsMinutes.map(Number).filter(n => Number.isFinite(n) && n > 0) : null;
    if (!durations || durations.length === 0) return error(res, 'Au moins une durée valide est requise');

    const config = await TradingConfig.findOneAndUpdate(
      {},
      { $set: { payoutPercent: Number(payoutPercent), durationsMinutes: durations } },
      { upsert: true, new: true }
    );
    await ActivityLog.create({ admin: req.user._id, action: 'Paramètres de trading modifiés', target: 'trading-config', details: `Taux ${payoutPercent}% / durées ${durations.join(',')}min`, level: 'info' });
    success(res, { config });
  } catch (err) { error(res, err.message); }
};
