// FORCED CACHE-BUST: Version 4 forces iPadOS to drop the old fast-redirect loop instantly
const CACHE_NAME = 'gitbook-workspace-v4';

// Local files required to register your custom Home Screen launcher app shell
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'sw.js'
];

// Install Event - Stores the local files securely into your iPad's storage layer
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching updated V4 launcher assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Forces this new V4 code to take charge immediately
  );
});

// Activate Event - Sweeps away the old, cached fast-redirect scripts
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing deprecated app caches...');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Instantly claim control over the PWA window context
  );
});

// Fetch Event - Routes dashboard requests securely to GitBook servers
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve local V4 script files instantly, but let GitBook handle everything else live via network
      return cachedResponse || fetch(event.request);
    })
  );
});
