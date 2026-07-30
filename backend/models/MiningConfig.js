const mongoose = require('mongoose');

const miningConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  rewardPerBlock: { type: Number, default: 0.5 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  maxHashratePerPack: {
    starter: { type: Number, default: 100 },
    booster: { type: Number, default: 500 },
    pro: { type: Number, default: 2000 },
    elite: { type: Number, default: 8000 },
    diamond: { type: Number, default: 30000 }
  },
  robots: [{
    id: { type: String, enum: ['neo', 'crypto', 'visionnaire'] },
    name: String,
    level: Number,
    price: Number,
    nlxPerHour: Number,
    dailyCap: Number,
    manualTaps: Number,
    lifetimeDays: Number
  }]
});

module.exports = mongoose.model('MiningConfig', miningConfigSchema);
