/* eslint-disable no-restricted-globals */

// Precaches the build's static assets (JS/CSS/HTML shell) so the app can
// launch offline. Deliberately does NOT cache anything under /api/ — this
// is a financial platform, and serving a stale wallet balance or investment
// status from cache would be actively misleading.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);

// App-shell routing: any same-origin navigation request that isn't for a
// file with an extension (and isn't an API call) falls back to index.html,
// letting React Router take over.
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_')) return false;
    if (url.pathname.startsWith('/api/')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Static images (logos, icons) can be served stale-while-revalidate.
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    !url.pathname.startsWith('/api/') &&
    (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpeg') || url.pathname.endsWith('.jpg')),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
