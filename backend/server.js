require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiters');
const { checkBlockedIp, startBlockedIpsCache } = require('./middleware/checkBlockedIp');
const { passport } = require('./config/passport');
const PlatformConfig = require('./models/PlatformConfig');
const User = require('./models/User');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(checkBlockedIp);

// Accept the configured FRONTEND_URL plus any extra origins listed in
// EXTRA_CORS_ORIGINS (comma-separated) — e.g. a LAN IP so the site can be
// reached from a phone on the same network during local development.
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.EXTRA_CORS_ORIGINS ? process.env.EXTRA_CORS_ORIGINS.split(',').map(o => o.trim()) : [])
];

const isDev = process.env.NODE_ENV !== 'production';

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (!isDev) return false;
  try {
    const { hostname, port } = new URL(origin);
    const localHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
    const isLan = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
    return (localHosts.includes(hostname) || isLan) && port === '3000';
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(mongoSanitize());
app.use(apiLimiter);
// Stateless OAuth (Google/Facebook) — we issue our own JWT after the
// provider handshake, so no session middleware is needed.
app.use(passport.initialize());

// KYC documents are personal identity data — they're served through an
// authenticated, ownership-checked route (see routes/kyc.js), never as
// plain static files.

const STAFF_ROLES = ['admin', 'superadmin', 'moderator'];

// When maintenance mode is on, block regular traffic but still let staff
// operate the admin panel (and everyone keep hitting /health and /auth so
// an admin can actually log back in).
const maintenanceGate = async (req, res, next) => {
  try {
    if (req.path.startsWith('/api/health') || req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
      return next();
    }
    const config = await PlatformConfig.findOne();
    if (!config?.maintenanceMode) return next();

    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && STAFF_ROLES.includes(user.role)) return next();
      } catch {
        // fall through to maintenance response
      }
    }
    return res.status(503).json({ success: false, message: config.maintenanceMsg || 'Plateforme en maintenance, veuillez réessayer plus tard' });
  } catch {
    return next();
  }
};
app.use(maintenanceGate);

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/referral', require('./routes/referral'));
app.use('/api/ambassador', require('./routes/ambassador'));
app.use('/api/academy', require('./routes/academy'));
app.use('/api/transparency', require('./routes/transparency'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/trading', require('./routes/trading'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  require('./services/investmentMaturity').start();
  require('./services/tradingSettlement').start();
  startBlockedIpsCache();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} déjà utilisé — le backend tourne peut-être déjà.`);
      process.exit(0);
    }
    throw err;
  });
});
