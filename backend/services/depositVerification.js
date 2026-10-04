const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PlatformConfig = require('../models/PlatformConfig');
const { verifyDeposit, isConfigured } = require('../utils/blockchainVerification');

const CHECK_INTERVAL_MS = 30 * 1000;

// Deposits are created as 'pending' with the user's claimed amount/network
// and their transaction hash as proof (see walletController.deposit). This
// polls those, checks each one against the real blockchain, and either
// credits the balance automatically (match found) or marks it rejected
// (an on-chain mismatch — never for "not found yet", which just gets
// retried next tick: a transaction can take a while to be mined/indexed).
const checkPendingDeposits = async () => {
  const pending = await Transaction.find({ type: 'deposit', status: 'pending' });
  if (pending.length === 0) return;

  const config = await PlatformConfig.findOne();
  if (!config?.usdtWallets?.length) return;

  for (const txn of pending) {
    try {
      const network = (txn.method || '').replace('usdt-', '');
      if (!isConfigured(network)) continue; // no API key for this network yet — leave pending for manual review

      const wallet = config.usdtWallets.find(w => w.network === network);
      if (!wallet) continue;

      const result = await verifyDeposit({
        network,
        txHash: txn.proof,
        expectedToAddress: wallet.address,
        expectedAmount: txn.amount
      });

      if (result.verified) {
        txn.status = 'completed';
        txn.updatedAt = new Date();
        await txn.save();
        await User.findByIdAndUpdate(txn.userId, { $inc: { balance: txn.amount } });
        console.log(`Deposit auto-verified: ${txn._id} (${txn.amount} USDT via ${network})`);
      } else if (['transaction_failed', 'no_matching_transfer', 'amount_mismatch'].includes(result.reason)) {
        // An explicit, confirmed mismatch — not "hasn't arrived yet". Flag
        // for manual review instead of silently retrying forever.
        txn.status = 'rejected';
        txn.rejectionReason = `Vérification automatique échouée: ${result.reason}${result.actualAmount ? ` (montant détecté: ${result.actualAmount})` : ''}`;
        txn.updatedAt = new Date();
        await txn.save();
        console.log(`Deposit auto-rejected: ${txn._id} (${result.reason})`);
      }
      // Any other reason (not_found_yet, not_configured, lookup_error) —
      // leave pending, retried next tick.
    } catch (err) {
      console.error(`Deposit verification failed for ${txn._id}:`, err.message);
    }
  }
};

const start = () => {
  setInterval(() => {
    checkPendingDeposits().catch(err => console.error('Deposit verification job failed:', err.message));
  }, CHECK_INTERVAL_MS);
  checkPendingDeposits().catch(err => console.error('Deposit verification job failed:', err.message));
};

module.exports = { start, checkPendingDeposits };
