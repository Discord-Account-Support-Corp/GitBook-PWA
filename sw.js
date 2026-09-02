// Force cache-busting by utilizing a distinct version marker
const CACHE_NAME = 'gitbook-workspace-v3';

// Specify the exact local file dependencies of your launcher shell
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'sw.js'
];

// Install Event - Stores the local files securely into your iPad's storage layer
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching launcher framework assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting()) // Forces the new worker to take charge immediately
  );
});

// Activate Event - Sweeps away old, glitched versions of your custom PWA shell
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

// Fetch Event - Intercepts requests locally but allows live network data to stream
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Serve local index/manifest files from cache for instant loading, 
      // but let GitBook's server handle everything else cleanly via the network.
      return cachedResponse || fetch(event.request);
    })
  );
});
