const isDev = process.env.NODE_ENV !== 'production';

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.EXTRA_CORS_ORIGINS
    ? process.env.EXTRA_CORS_ORIGINS.split(',').map((o) => o.trim())
    : []),
];

const isAllowedFrontendOrigin = (origin) => {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  if (!isDev) return false;
  try {
    const { hostname, port } = new URL(origin);
    const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
    const isLan = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
    return (localHosts.includes(hostname) || isLan) && ['3000', '3001', ''].includes(port);
  } catch {
    return false;
  }
};

const frontendUrlFromRequest = (req) => {
  const candidates = [req.get('origin'), req.get('referer')].filter(Boolean);
  for (const raw of candidates) {
    try {
      const url = new URL(raw);
      const origin = url.origin;
      if (isAllowedFrontendOrigin(origin)) return origin;
    } catch {
      // ignore malformed header
    }
  }
  return process.env.FRONTEND_URL || 'http://localhost:3000';
};

module.exports = { frontendUrlFromRequest, isAllowedFrontendOrigin };
