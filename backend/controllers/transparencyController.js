const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PlatformConfig = require('../models/PlatformConfig');
const { success, error } = require('../utils/response');

exports.getAudit = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInvestors = await Investment.distinct('userId').then(arr => arr.length);
    const totalFunds = await Investment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).then(r => r[0]?.total || 0);
    const totalPayouts = await Transaction.countDocuments({ type: 'withdrawal', status: 'completed' });

    const recentTransactions = await Transaction.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName');

    success(res, {
      totalFundsManaged: totalFunds,
      totalInvestors,
      totalPayoutsCompleted: totalPayouts,
      lastAuditDate: new Date(),
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
      averageRoi: '8.5',
      onTimePaymentRate: '99.2',
      totalUsers,
      recentTransactions: recentTransactions.map(tx => ({
        txHash: tx.reference,
        type: tx.type === 'withdrawal' ? 'Payout' : tx.type,
        amount: `${tx.amount} EUR`,
        date: tx.createdAt,
        status: tx.status === 'completed' ? 'confirmed' : 'pending'
      }))
    });
  } catch (err) {
    error(res, err.message);
  }
};
