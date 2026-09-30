const AcademyVideo = require('../models/AcademyVideo');
const AcademyProgress = require('../models/AcademyProgress');
const { success, error } = require('../utils/response');

exports.getProgress = async (req, res) => {
  try {
    let progress = await AcademyProgress.findOne({ userId: req.user._id });
    if (!progress) progress = await AcademyProgress.create({ userId: req.user._id });
    const videos = await AcademyVideo.find({ active: true });
    success(res, { completedVideos: progress.completedVideos, videos });
  } catch (err) {
    error(res, err.message);
  }
};

exports.completeVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    const video = await AcademyVideo.findById(videoId);
    if (!video) return error(res, 'Video not found', 404);

    // Ensure the progress doc exists first (idempotent — relies on the
    // unique index on userId if two first-ever requests race here).
    try {
      await AcademyProgress.findOneAndUpdate(
        { userId: req.user._id },
        { $setOnInsert: { userId: req.user._id, completedVideos: [] } },
        { upsert: true }
      );
    } catch (e) { /* duplicate key from a concurrent first-insert — the doc exists now either way */ }

    // Atomic check-and-append: the $ne filter means two concurrent
    // completions of the same video can't both pass "not yet completed"
    // before either has recorded it.
    const progress = await AcademyProgress.findOneAndUpdate(
      { userId: req.user._id, completedVideos: { $ne: videoId } },
      { $push: { completedVideos: videoId } },
      { new: true }
    );

    if (!progress) {
      const existing = await AcademyProgress.findOne({ userId: req.user._id });
      return success(res, { progress: existing, message: 'Already completed' });
    }

    success(res, { progress });
  } catch (err) {
    error(res, err.message);
  }
};
