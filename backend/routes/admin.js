const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const ctrl = require('../controllers/adminController');

router.use(auth, admin('admin', 'superadmin', 'moderator'));

router.get('/stats/overview', ctrl.statsOverview);
router.get('/alerts', ctrl.alerts);
router.get('/activity/recent', ctrl.recentActivity);

router.get('/users', ctrl.listUsers);
router.post('/users/create', ctrl.createUser);
router.post('/users/:userId/suspend', ctrl.suspendUser);
router.post('/users/:userId/activate', ctrl.activateUser);
router.post('/users/:userId/adjust-balance', ctrl.adjustBalance);
router.put('/users/:userId/role', ctrl.changeUserRole);

router.get('/kyc', ctrl.listKyc);
router.post('/kyc/:kycId/approve', ctrl.approveKyc);
router.post('/kyc/:kycId/reject', ctrl.rejectKyc);

router.get('/referrals/stats', ctrl.referralStats);
router.put('/referrals/commissions', ctrl.updateCommissionRates);

router.get('/investments', ctrl.listInvestments);
router.put('/investments/packs-config', ctrl.updatePacksConfig);
router.post('/investments/:id/close', ctrl.closeInvestment);

router.get('/transactions', ctrl.listTransactions);
router.post('/transactions/:txId/approve', ctrl.approveTransaction);
router.post('/transactions/:txId/reject', ctrl.rejectTransaction);

router.get('/nlx/stats', ctrl.nlxStats);
router.put('/nlx/rate', ctrl.updateNlxRate);
router.post('/nlx/adjust', ctrl.adjustNlx);

router.get('/mining/stats', ctrl.miningStats);
router.get('/mining/config', ctrl.getMiningConfig);
router.get('/mining/active', ctrl.activeMiners);
router.put('/mining/config', ctrl.saveMiningConfig);

router.get('/ads', ctrl.listAds);
router.get('/ads/stats', ctrl.adsStats);
router.post('/ads', ctrl.createAd);
router.put('/ads/:adId', ctrl.updateAd);
router.delete('/ads/:adId', ctrl.deleteAd);

router.get('/academy/courses', ctrl.listCourses);
router.post('/academy/courses', ctrl.createCourse);
router.put('/academy/courses/:id', ctrl.updateCourse);

router.get('/vip-expeditions', ctrl.listExpeditions);
router.post('/vip-expeditions', ctrl.createExpedition);
router.get('/vip-expeditions/:id/participants', ctrl.getExpeditionParticipants);

router.post('/communications/notification', ctrl.sendNotification);
router.post('/communications/email', ctrl.sendEmail);
router.post('/communications/new-project', ctrl.sendNewProjectNotification);

router.get('/config', ctrl.getConfig);
router.put('/config', ctrl.saveConfig);

router.get('/logs/activity', ctrl.recentActivity);
router.get('/security/blocked-ips', ctrl.blockedIps);
router.post('/security/block-ip', ctrl.blockIp);
router.delete('/security/blocked-ips/:ip', ctrl.unblockIp);

router.get('/reports/:type', ctrl.generateReport);

module.exports = router;
