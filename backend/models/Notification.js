const mongoose = require('mongoose');

// Fanned out one document per targeted user at creation time (rather than a
// single broadcast row + shared read-state tracking) — simpler to query
// ("my unread notifications") and correct at this platform's scale, at the
// cost of N documents when a code is open to everyone rather than one.
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['trading_code'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
