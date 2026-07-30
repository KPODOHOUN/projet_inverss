const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  breakdown: {
    taps: { type: Number, default: 0 },
    videos: { type: Number, default: 0 },
    network: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  weekStart: { type: Date },
  paidAt: { type: Date }
});

module.exports = mongoose.model('PaymentHistory', paymentHistorySchema);
