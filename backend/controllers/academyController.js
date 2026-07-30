const AcademyVideo = require('../models/AcademyVideo');
const AcademyProgress = require('../models/AcademyProgress');
const { success, error } = require('../utils/response');

exports.getProgress = async (req, res) => {
  try {
    let progress = await AcademyProgress.findOne({ userId: req.user._id });
    if (!progress) progress = await AcademyProgress.create({ userId: req.user._id });
    const videos = await AcademyVideo.find({ active: true });
    success(res, { completedVideos: progress.completedVideos, totalEarned: progress.totalEarned, videos });
  } catch (err) {
    error(res, err.message);
  }
};

exports.completeVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    const video = await AcademyVideo.findById(videoId);
    if (!video) return error(res, 'Video not found', 404);

    let progress = await AcademyProgress.findOne({ userId: req.user._id });
    if (!progress) progress = new AcademyProgress({ userId: req.user._id });

    if (progress.completedVideos.includes(videoId)) {
      return success(res, { progress, message: 'Already completed' });
    }

    progress.completedVideos.push(videoId);
    progress.totalEarned += video.reward;
    await progress.save();

    success(res, { progress, reward: video.reward });
  } catch (err) {
    error(res, err.message);
  }
};
