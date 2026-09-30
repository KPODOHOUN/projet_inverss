const success = (res, data, status = 200) => {
  return res.status(status).json({ success: true, data });
};

const error = (res, message, status = 400, extra = {}) => {
  return res.status(status).json({ success: false, message, ...extra });
};

module.exports = { success, error };
