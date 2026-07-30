const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number
});

const academyVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: Number, default: 1 },
  duration: { type: Number, default: 0 },
  reward: { type: Number, default: 0 },
  category: { type: String, enum: ['crypto', 'investment', 'trading', 'platform'], default: 'crypto' },
  youtubeId: { type: String, required: true },
  description: { type: String, default: '' },
  quiz: [quizSchema],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AcademyVideo', academyVideoSchema);
