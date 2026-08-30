const CACHE_NAME = 'gitbook-space-v1';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-192.svg',
  'icons/icon-512.svg'
];

// Install: cache shell assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => (key === CACHE_NAME ? null : caches.delete(key)))
    )).then(() => self.clients.claim())
  );
});

// Fetch: 1) navigation requests -> network fallback to cache(index.html)
//        2) other requests -> cache-first then network (and cache successful same-origin responses)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // SPA navigation fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(resp => resp).catch(() => caches.match('index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(networkResp => {
        // Cache same-origin successful responses for future use
        if (networkResp && networkResp.status === 200 && networkResp.type !== 'opaque') {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResp;
      }).catch(() => caches.match('index.html'));
    })
  );
});
