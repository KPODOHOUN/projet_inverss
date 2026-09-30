const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
  platformName: { type: String, default: 'IMC' },
  supportEmail: { type: String, default: 'support@imc.com' },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMsg: { type: String, default: '' },
  withdrawalFee: { type: Number, default: 2 },
  minWithdrawal: { type: Number, default: 1 },
  maxWithdrawal: { type: Number, default: 50000 },
  // USDT is the platform's only payment asset (deposits and withdrawals) —
  // set once a real wallet exists; left empty until then so the deposit UI
  // can show a clear "not yet configured" state instead of a fake address.
  usdtWalletAddress: { type: String, default: '' },
  usdtNetwork: { type: String, enum: ['TRC20', 'ERC20', 'BEP20'], default: 'TRC20' },
  modules: {
    academy: { type: Boolean, default: true },
    referral: { type: Boolean, default: true }
  },
  referralCommissionRate: { type: Number, default: 10 }, // % of invested amount, paid to the direct referrer in USD
  ambassadorCommissionRate: { type: Number, default: 10 } // % of a referred user's REALIZED EARNINGS (not invested amount), paid to their Ambassador
});

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
