const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const ctrl = require('../controllers/adminController');

// Any staff role (moderator, admin, superadmin) can authenticate into the admin area.
router.use(auth, admin('admin', 'superadmin', 'moderator'));

// Staff-wide (read-only / review) — moderators included.
router.get('/stats/overview', ctrl.statsOverview);
router.get('/alerts', ctrl.alerts);
router.get('/activity/recent', ctrl.recentActivity);
router.get('/logs/activity', ctrl.listActivityLogs);

router.get('/users', ctrl.listUsers);
router.post('/users/:userId/suspend', ctrl.suspendUser);
router.post('/users/:userId/activate', ctrl.activateUser);

router.get('/kyc', ctrl.listKyc);
router.post('/kyc/:kycId/approve', ctrl.approveKyc);
router.post('/kyc/:kycId/reject', ctrl.rejectKyc);

router.get('/referrals/stats', ctrl.referralStats);

router.get('/investments', ctrl.listInvestments);
router.get('/transactions', ctrl.listTransactions);

router.get('/academy/courses', ctrl.listCourses);

router.get('/trading/assets', ctrl.listTradingAssets);
router.get('/trading/codes', ctrl.listTradingCodes);
router.get('/trading/positions', ctrl.listTradingPositions);
router.get('/trading/settings', ctrl.getTradingSettings);

router.get('/security/blocked-ips', ctrl.blockedIps);
router.get('/reports/:type', ctrl.generateReport);

// Money-moving / privilege-granting actions — admin & superadmin only.
const financial = admin('admin', 'superadmin');

router.post('/users/create', financial, ctrl.createUser);
router.post('/users/:userId/adjust-balance', financial, ctrl.adjustBalance);
router.put('/users/:userId/role', financial, ctrl.changeUserRole);
router.post('/users/:userId/force-verify-kyc', financial, ctrl.forceVerifyKyc);
router.post('/users/:userId/delete', financial, ctrl.deleteUserDirect);
router.get('/account-deletions', financial, ctrl.listAccountDeletionRequests);
router.post('/account-deletions/:id/approve', financial, ctrl.approveAccountDeletion);
router.post('/account-deletions/:id/reject', financial, ctrl.rejectAccountDeletion);

router.put('/referrals/commissions', financial, ctrl.updateCommissionRates);

// Ambassador program — creation/edit/password-reset restricted to
// superadmin per the program's rules; listing/viewing open to any admin.
router.get('/ambassadors', financial, ctrl.listAmbassadors);
router.get('/ambassadors/:id', financial, ctrl.getAmbassadorDetail);
router.post('/ambassadors', admin('superadmin'), ctrl.createAmbassador);
router.put('/ambassadors/:id', admin('superadmin'), ctrl.updateAmbassador);
router.post('/ambassadors/:id/reset-password', admin('superadmin'), ctrl.resetAmbassadorPassword);

router.put('/investments/packs-config', financial, ctrl.updatePacksConfig);
router.post('/investments/:id/close', financial, ctrl.closeInvestment);

router.post('/transactions/:txId/approve', financial, ctrl.approveTransaction);
router.post('/transactions/:txId/process', financial, ctrl.processTransaction);
router.post('/transactions/:txId/complete', financial, ctrl.completeTransaction);
router.post('/transactions/:txId/reject', financial, ctrl.rejectTransaction);
router.post('/transactions/:txId/cancel', financial, ctrl.cancelTransaction);
router.post('/transactions/:txId/execute-payout', financial, ctrl.executeWithdrawalPayout);
router.post('/transactions/:txId/verify-payout', financial, ctrl.verifyWithdrawalPayout);
router.post('/transactions/:txId/payout-status', financial, ctrl.checkWithdrawalPayoutStatus);

router.post('/academy/courses', financial, ctrl.createCourse);
router.put('/academy/courses/:id', financial, ctrl.updateCourse);
router.delete('/academy/courses/:id', financial, ctrl.deleteCourse);

router.get('/faq', ctrl.listFAQs);
router.post('/faq', financial, ctrl.createFAQ);
router.put('/faq/:id', financial, ctrl.updateFAQ);
router.delete('/faq/:id', financial, ctrl.deleteFAQ);

router.post('/trading/assets', financial, ctrl.createTradingAsset);
router.put('/trading/assets/:key', financial, ctrl.updateTradingAsset);
router.post('/trading/codes', financial, ctrl.createTradingCode);
router.put('/trading/codes/:id/status', financial, ctrl.updateTradingCodeStatus);
router.put('/trading/settings', financial, ctrl.saveTradingSettings);

router.get('/config', financial, ctrl.getConfig);
router.put('/config', financial, ctrl.saveConfig);

router.post('/security/block-ip', financial, ctrl.blockIp);
router.delete('/security/blocked-ips/:ip', financial, ctrl.unblockIp);

module.exports = router;
