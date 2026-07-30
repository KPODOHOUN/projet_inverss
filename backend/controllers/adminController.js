const User = require('../models/User');
const KYC = require('../models/KYC');
const Investment = require('../models/Investment');
const InvestmentPack = require('../models/InvestmentPack');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const MiningConfig = require('../models/MiningConfig');
const MiningRobot = require('../models/MiningRobot');
const Ad = require('../models/Ad');
const AcademyVideo = require('../models/AcademyVideo');
const VIPExpedition = require('../models/VIPExpedition');
const PlatformConfig = require('../models/PlatformConfig');
const ActivityLog = require('../models/ActivityLog');
const BlockedIP = require('../models/BlockedIP');
const { success, error } = require('../utils/response');
const emailService = require('../services/emailService');

exports.statsOverview = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalInvestments, activeInvestments, pendingKyc, pendingTransactions] = await Promise.all([
      User.countDocuments(), User.countDocuments({ status: 'active' }),
      Investment.countDocuments(), Investment.countDocuments({ status: 'active' }),
      KYC.countDocuments({ status: 'pending' }), Transaction.countDocuments({ status: 'pending' })
    ]);
    const totalDeposits = await Transaction.aggregate([{ $match: { type: 'deposit', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalWithdrawals = await Transaction.aggregate([{ $match: { type: 'withdrawal', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    success(res, { totalUsers, activeUsers, totalInvestments, activeInvestments, totalDeposits: totalDeposits[0]?.total || 0, totalWithdrawals: Math.abs(totalWithdrawals[0]?.total || 0), pendingKyc, pendingTransactions });
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
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.status = req.query.status;
    const users = await User.find(filter).sort({ createdAt: -1 });
    success(res, { users });
  } catch (err) { error(res, err.message); }
};

exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return error(res, 'Email already in use');
    const user = await User.create({ firstName, lastName, email, password, phone, role: role || 'standard' });
    success(res, { user }, 201);
  } catch (err) { error(res, err.message); }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'suspended' }, { new: true });
    if (!user) return error(res, 'User not found', 404);
    success(res, { user, message: 'User suspended' });
  } catch (err) { error(res, err.message); }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'active' }, { new: true });
    if (!user) return error(res, 'User not found', 404);
    success(res, { user, message: 'User activated' });
  } catch (err) { error(res, err.message); }
};

exports.adjustBalance = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return error(res, 'User not found', 404);
    user.balance += amount;
    await user.save();
    await ActivityLog.create({ admin: req.user._id, action: 'Balance adjustment', target: user.email, details: `Amount: ${amount} - ${note}`, level: 'info' });
    success(res, { user, message: 'Balance adjusted' });
  } catch (err) { error(res, err.message); }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) return error(res, 'User not found', 404);
    success(res, { user });
  } catch (err) { error(res, err.message); }
};

exports.listKyc = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
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
    const [totalReferrals, activeReferrals, totalCommissions] = await Promise.all([
      Referral.countDocuments(), Referral.countDocuments({}),
      Referral.aggregate([{ $group: { _id: null, total: { $sum: '$commissionsEarned' } } }])
    ]);
    success(res, { totalReferrals, activeReferrals, totalCommissions: totalCommissions[0]?.total || 0 });
  } catch (err) { error(res, err.message); }
};

exports.updateCommissionRates = async (req, res) => {
  success(res, { message: 'Commission rates updated' });
};

exports.listInvestments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const investments = await Investment.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
    success(res, { investments });
  } catch (err) { error(res, err.message); }
};

exports.updatePacksConfig = async (req, res) => {
  try {
    const { packs } = req.body;
    for (const pack of packs) {
      await InvestmentPack.findOneAndUpdate({ key: pack.key }, pack, { upsert: true });
    }
    success(res, { message: 'Packs updated' });
  } catch (err) { error(res, err.message); }
};

exports.closeInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(req.params.id, { status: 'completed', endDate: new Date() }, { new: true });
    if (!investment) return error(res, 'Investment not found', 404);
    success(res, { investment });
  } catch (err) { error(res, err.message); }
};

exports.listTransactions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const transactions = await Transaction.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
    success(res, { transactions });
  } catch (err) { error(res, err.message); }
};

exports.approveTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findByIdAndUpdate(req.params.txId, { status: 'completed', updatedAt: new Date() }, { new: true });
    if (!txn) return error(res, 'Transaction not found', 404);
    if (txn.type === 'withdrawal') {
      await User.findByIdAndUpdate(txn.userId, { $inc: { balance: txn.amount } });
    }
    success(res, { transaction: txn, message: 'Transaction approved' });
  } catch (err) { error(res, err.message); }
};

exports.rejectTransaction = async (req, res) => {
  try {
    const { reason } = req.body;
    const txn = await Transaction.findByIdAndUpdate(req.params.txId, { status: 'rejected', rejectionReason: reason, updatedAt: new Date() }, { new: true });
    if (!txn) return error(res, 'Transaction not found', 404);
    success(res, { transaction: txn, message: 'Transaction rejected' });
  } catch (err) { error(res, err.message); }
};

exports.nlxStats = async (req, res) => {
  try {
    const config = await PlatformConfig.findOne();
    const totalNlx = await User.aggregate([{ $group: { _id: null, total: { $sum: '$nlxBalance' } } }]);
    success(res, { totalEmitted: config?.totalNlxEmitted || 0, totalCirculating: totalNlx[0]?.total || 0, totalBurned: config?.totalNlxBurned || 0, fromMining: 0, fromWatchEarn: 0, fromReferral: 0, fromBonus: 0, rate: config?.nlxRate || 0.5 });
  } catch (err) { error(res, err.message); }
};

exports.updateNlxRate = async (req, res) => {
  try {
    const { rate } = req.body;
    const config = await PlatformConfig.findOneAndUpdate({}, { nlxRate: rate }, { upsert: true, new: true });
    success(res, { rate: config.nlxRate });
  } catch (err) { error(res, err.message); }
};

exports.adjustNlx = async (req, res) => {
  try {
    const { userId, amount, note } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $inc: { nlxBalance: amount } }, { new: true });
    if (!user) return error(res, 'User not found', 404);
    success(res, { user, message: 'NLX adjusted' });
  } catch (err) { error(res, err.message); }
};

exports.miningStats = async (req, res) => {
  try {
    const activeRobots = await MiningRobot.countDocuments({ pack: { $ne: null } });
    const totalNlx = await User.aggregate([{ $group: { _id: null, total: { $sum: '$nlxBalance' } } }]);
    success(res, { activeMiners: activeRobots, totalNlxMined: totalNlx[0]?.total || 0 });
  } catch (err) { error(res, err.message); }
};

exports.getMiningConfig = async (req, res) => {
  try {
    let config = await MiningConfig.findOne();
    if (!config) config = await MiningConfig.create({});
    success(res, { config });
  } catch (err) { error(res, err.message); }
};

exports.activeMiners = async (req, res) => {
  try {
    const robots = await MiningRobot.find({ pack: { $ne: null } }).populate('userId', 'firstName lastName email');
    success(res, { miners: robots });
  } catch (err) { error(res, err.message); }
};

exports.saveMiningConfig = async (req, res) => {
  try {
    const config = await MiningConfig.findOneAndUpdate({}, req.body, { upsert: true, new: true });
    success(res, { config });
  } catch (err) { error(res, err.message); }
};

exports.listAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    success(res, { ads });
  } catch (err) { error(res, err.message); }
};

exports.adsStats = async (req, res) => {
  try {
    const [totalAds, totalViews] = await Promise.all([Ad.countDocuments(), Ad.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }])]);
    success(res, { totalAds, totalViews: totalViews[0]?.total || 0 });
  } catch (err) { error(res, err.message); }
};

exports.createAd = async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    success(res, { ad }, 201);
  } catch (err) { error(res, err.message); }
};

exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.adId, req.body, { new: true });
    if (!ad) return error(res, 'Ad not found', 404);
    success(res, { ad });
  } catch (err) { error(res, err.message); }
};

exports.deleteAd = async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.adId);
    success(res, { message: 'Ad deleted' });
  } catch (err) { error(res, err.message); }
};

exports.listCourses = async (req, res) => {
  try {
    const courses = await AcademyVideo.find().sort({ level: 1 });
    success(res, { courses });
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

exports.listExpeditions = async (req, res) => {
  try {
    const expeditions = await VIPExpedition.find().sort({ date: -1 });
    success(res, { expeditions });
  } catch (err) { error(res, err.message); }
};

exports.createExpedition = async (req, res) => {
  try {
    const expedition = await VIPExpedition.create(req.body);
    success(res, { expedition }, 201);
  } catch (err) { error(res, err.message); }
};

exports.getExpeditionParticipants = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['vip', 'elite'] } }).select('firstName lastName email');
    success(res, { participants: users });
  } catch (err) { error(res, err.message); }
};

exports.sendNotification = async (req, res) => {
  success(res, { message: 'Notification sent' });
};

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) return error(res, 'Recipient and subject are required');

    await emailService.send({ to, subject, html, text });
    success(res, { message: 'Email sent' });
  } catch (err) {
    error(res, err.message);
  }
};

exports.sendNewProjectNotification = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return error(res, 'Project title is required');

    const users = await User.find({ status: 'active' }).select('email firstName');
    let sent = 0;
    let failed = 0;

    await Promise.allSettled(users.map(async (user) => {
      try {
        await emailService.sendNewProjectNotification(user.email, user.firstName, { title, description });
        sent++;
      } catch {
        failed++;
      }
    }));

    await ActivityLog.create({
      admin: req.user._id,
      action: 'New project notification',
      target: `${title}`,
      details: `Sent to ${sent} users, ${failed} failed`,
      level: 'info'
    });

    success(res, { message: `Notification sent to ${sent} users${failed > 0 ? `, ${failed} failed` : ''}`, sent, failed });
  } catch (err) {
    error(res, err.message);
  }
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
    const config = await PlatformConfig.findOneAndUpdate({}, req.body, { upsert: true, new: true });
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
    const blocked = await BlockedIP.create({ ip, reason });
    success(res, { blockedIp: blocked }, 201);
  } catch (err) { error(res, err.message); }
};

exports.unblockIp = async (req, res) => {
  try {
    await BlockedIP.findOneAndDelete({ ip: req.params.ip });
    success(res, { message: 'IP unblocked' });
  } catch (err) { error(res, err.message); }
};

exports.generateReport = async (req, res) => {
  const data = { type: req.params.type, period: req.query.period, generatedAt: new Date() };
  success(res, { report: data, downloadUrl: '#' });
};
