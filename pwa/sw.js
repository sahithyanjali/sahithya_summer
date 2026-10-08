// Sphoorthi Seva Trust Service Worker (PWA Offline Engine)
const CACHE_NAME = 'sphoorthi-seva-v1';
const STATIC_ASSETS = [
  '/pwa/',
  '/pwa/index.html',
  '/pwa/offline.html',
  '/pwa/pwa-app.js',
  '/pwa/manifest.json'
];

// 1. Install Event: Cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Stale-while-revalidate for API, Cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle backend API requests: Network first with Cache fallback
  if (url.pathname.startsWith('/api/v1/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Handle Static App Shell Navigation: Cache first with Offline fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/pwa/offline.html');
        }
      });
    })
  );
});
