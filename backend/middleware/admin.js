const admin = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non authentifié' });
    }
    if (req.user.role !== 'superadmin' && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accès administrateur requis' });
    }
    next();
  };
};

module.exports = admin;
