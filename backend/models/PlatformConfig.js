const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
  platformName: { type: String, default: 'IMC' },
  supportEmail: { type: String, default: 'support@imc.com' },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMsg: { type: String, default: '' },
  withdrawalFee: { type: Number, default: 2 },
  minWithdrawal: { type: Number, default: 1 },
  maxWithdrawal: { type: Number, default: 50000 },
  // USDT is the platform's only payment asset (deposits and withdrawals).
  // Multiple networks can be configured at once (the same USDT token exists
  // on several chains) — the user picks one at deposit time and sends to its
  // matching address. Left empty until an admin adds at least one, so the
  // deposit UI can show a clear "not yet configured" state.
  usdtWallets: [{
    network: { type: String, enum: ['TRC20', 'ERC20', 'BEP20', 'POLYGON'], required: true },
    address: { type: String, required: true }
  }],
  modules: {
    academy: { type: Boolean, default: true },
    referral: { type: Boolean, default: true }
  },
  referralCommissionRate: { type: Number, default: 10 }, // % of invested amount, paid to the direct referrer in USD
  ambassadorCommissionRate: { type: Number, default: 10 } // % of a referred user's REALIZED EARNINGS (not invested amount), paid to their Ambassador
});

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
