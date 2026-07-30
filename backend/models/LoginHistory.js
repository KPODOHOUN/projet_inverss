const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  location: { type: String, default: '' },
  device: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

loginHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
