const mongoose = require('mongoose');

const academyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AcademyVideo' }],
  totalEarned: { type: Number, default: 0 }
});

module.exports = mongoose.model('AcademyProgress', academyProgressSchema);
