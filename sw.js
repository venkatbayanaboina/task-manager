/* ================================================================
   sw.js — Service Worker for Task Manager PWA
   Strategy: Cache First — serve from cache, fall back to network.
   All core assets cached on install so the app works fully offline.
   ================================================================ */

const CACHE = 'task-manager-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/CSS/main.css',
  '/JS/main.js',
  '/JS/time.js',
  '/assets/favicon.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/manifest.json'
];

/* ── Install: cache all core assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ── Activate: delete old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: serve from cache, fall back to network ── */
self.addEventListener('fetch', event => {
  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        /* Cache valid network responses for future offline use */
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
