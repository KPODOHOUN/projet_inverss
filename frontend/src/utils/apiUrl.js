// Prefer an explicit override (REACT_APP_API_URL) when set — e.g. a real
// production deployment where the API lives on a different domain entirely.
//
// Otherwise always use the same-origin `/api` path. In dev, the CRA
// dev-server proxy (setupProxy.js) forwards it to the backend — works on any
// dev port, localhost, 127.0.0.1, and LAN IP (phone) without CORS. In
// production, nginx reverse-proxies `/api/` to the backend on the same
// origin/port (see the server's nginx site config) — there is no public
// port 5000 to hit directly, so a same-origin path is the only thing that
// works there too.
export const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }

  return '/api';
};
