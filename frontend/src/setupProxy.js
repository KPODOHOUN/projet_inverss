const { createProxyMiddleware } = require('http-proxy-middleware');

// CRA dev-server proxy: every /api/* call is forwarded to the backend.
// If the backend is down, return a clear JSON error instead of a blank
// "connection refused" page that confuses the login form.
module.exports = function setupProxy(app) {
  const proxyOpts = {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true,
    onError(err, req, res) {
      console.warn('[proxy] backend unreachable:', err.message);
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
      }
      res.end(
        JSON.stringify({
          success: false,
          message:
            'Serveur backend indisponible. Lancez-le avec « npm run dev » à la racine du projet (port 5000).',
        })
      );
    },
  };

  app.use('/api', createProxyMiddleware(proxyOpts));
  // Avatars (served by the backend — see server.js) need the same relative
  // path to work both in dev and in production (nginx proxies /uploads/
  // there too), so the stored avatarUrl never needs an environment branch.
  app.use('/uploads', createProxyMiddleware(proxyOpts));
};
