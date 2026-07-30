const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
  platformName: { type: String, default: 'NELIAXA' },
  supportEmail: { type: String, default: 'support@neliaxa.com' },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMsg: { type: String, default: '' },
  withdrawalFee: { type: Number, default: 2 },
  minWithdrawal: { type: Number, default: 1 },
  maxWithdrawal: { type: Number, default: 50000 },
  modules: {
    mining: { type: Boolean, default: true },
    watchToEarn: { type: Boolean, default: true },
    academy: { type: Boolean, default: true },
    referral: { type: Boolean, default: true },
    vipExpeditions: { type: Boolean, default: true }
  },
  nlxRate: { type: Number, default: 0.5 },
  totalNlxEmitted: { type: Number, default: 0 },
  totalNlxBurned: { type: Number, default: 0 }
});

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
