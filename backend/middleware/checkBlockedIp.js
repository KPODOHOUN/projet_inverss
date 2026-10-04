const BlockedIP = require('../models/BlockedIP');

// The admin "IPs Bloquées" panel has existed for a while but never actually
// rejected anything — BlockedIP was a data model with no enforcement
// anywhere in the request pipeline. This is that enforcement.
//
// Blocked IPs are cached in memory (refreshed periodically + immediately on
// every block/unblock) rather than queried from Mongo on every request —
// this runs ahead of all routes, so it's on the hot path for 100% of
// traffic.
let blockedSet = new Set();

const refreshBlockedIpsCache = async () => {
  try {
    const docs = await BlockedIP.find({}, 'ip');
    blockedSet = new Set(docs.map(d => d.ip));
  } catch (err) {
    console.error('Failed to refresh blocked IPs cache:', err.message);
  }
};

const REFRESH_INTERVAL_MS = 60 * 1000;
const startBlockedIpsCache = () => {
  refreshBlockedIpsCache();
  setInterval(refreshBlockedIpsCache, REFRESH_INTERVAL_MS);
};

const checkBlockedIp = (req, res, next) => {
  if (blockedSet.has(req.ip)) {
    return res.status(403).json({ success: false, message: 'Accès refusé' });
  }
  next();
};

module.exports = { checkBlockedIp, startBlockedIpsCache, refreshBlockedIpsCache };
