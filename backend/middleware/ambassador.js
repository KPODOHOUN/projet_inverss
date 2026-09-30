// Restricted-role gate for the Ambassador's own dashboard — mirrors
// middleware/admin.js's style, but for a customer-facing role rather than
// staff, so it can't just reuse the admin(...) factory.
const requireAmbassador = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  if (req.user.role !== 'ambassador' && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Accès ambassadeur requis' });
  }
  next();
};

module.exports = requireAmbassador;
