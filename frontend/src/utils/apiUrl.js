// Prefer an explicit override (REACT_APP_API_URL) when set — e.g. a real
// production deployment where the API lives on a different domain entirely.
//
// In local development, always use the same-origin `/api` path so the CRA
// dev-server proxy forwards to the backend — works on any dev port (3000,
// 3001, …), localhost, 127.0.0.1, and LAN IP (phone) without CORS.
export const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (process.env.NODE_ENV === 'development') {
      return '/api';
    }
    return `${protocol}//${hostname}:5000/api`;
  }

  return 'http://localhost:5000/api';
};
