const mongoose = require('mongoose');

const miningRobotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  pack: { type: String, enum: ['neo', 'crypto', 'visionnaire'], default: null },
  level: { type: Number, default: 0 },
  activatedAt: { type: Date },
  expiresAt: { type: Date },
  nlxEarnedToday: { type: Number, default: 0 },
  tapsToday: { type: Number, default: 0 },
  lastTapReset: { type: Date, default: Date.now },
  lastEarningUpdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MiningRobot', miningRobotSchema);
