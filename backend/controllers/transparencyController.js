const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { success, error } = require('../utils/response');

// Every figure here is computed from real platform data — no fabricated
// certifications, wallet addresses, or audit claims. Only report what can
// actually be backed by the database.
exports.getAudit = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInvestors = await Investment.distinct('userId').then(arr => arr.length);
    const totalFundsManaged = await Investment.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).then(r => r[0]?.total || 0);
    const totalPayoutsCompleted = await Transaction.countDocuments({ type: { $in: ['withdrawal', 'earning'] }, status: 'completed' });

    const roiAgg = await Investment.aggregate([
      { $match: { status: { $in: ['active', 'completed'] } } },
      { $group: { _id: null, avg: { $avg: '$roi' } } }
    ]);
    const averageRoi = roiAgg[0]?.avg ? Number(roiAgg[0].avg.toFixed(2)) : 0;

    const recentTransactions = await Transaction.find({ status: 'completed' })
      .sort({ createdAt: -1 }).limit(10).populate('userId', 'firstName lastName');

    success(res, {
      totalFundsManaged,
      totalUsers,
      totalInvestors,
      totalPayoutsCompleted,
      averageRoi,
      lastUpdated: new Date(),
      recentTransactions: recentTransactions.map(tx => ({
        reference: tx.reference,
        type: tx.type,
        amount: `${Math.abs(tx.amount)} USD`,
        date: tx.createdAt,
        status: tx.status
      }))
    });
  } catch (err) {
    error(res, err.message);
  }
};
