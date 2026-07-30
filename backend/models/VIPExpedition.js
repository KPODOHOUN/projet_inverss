const mongoose = require('mongoose');

const vipExpeditionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: Date },
  description: { type: String, default: '' },
  maxParticipants: { type: Number, default: 0 },
  minPack: { type: String, enum: ['elite', 'diamond'], default: 'elite' },
  registered: { type: Number, default: 0 },
  status: { type: String, enum: ['open', 'full', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VIPExpedition', vipExpeditionSchema);
