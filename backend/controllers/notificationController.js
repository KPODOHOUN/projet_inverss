const Notification = require('../models/Notification');
const { success, error } = require('../utils/response');

exports.list = async (req, res) => {
  try {
    // The TTL monitor only sweeps about once a minute, so also filter here so
    // a notification never shows past its 5 days.
    const since = new Date(Date.now() - Notification.TTL_SECONDS * 1000);
    const notifications = await Notification.find({ userId: req.user._id, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false, createdAt: { $gte: since } });
    success(res, { notifications, unreadCount });
  } catch (err) { error(res, err.message); }
};

exports.markRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return error(res, 'Notification not found', 404);
    success(res, { notification: notif });
  } catch (err) { error(res, err.message); }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    success(res, { message: 'All notifications marked as read' });
  } catch (err) { error(res, err.message); }
};
