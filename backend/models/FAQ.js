const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
  category: {
    type: String,
    enum: ['compte', 'depots', 'retraits', 'investissement', 'trading', 'parrainage', 'securite', 'verification', 'academie'],
    required: true
  },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

faqSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
