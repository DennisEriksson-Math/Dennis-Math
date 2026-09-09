---
---
// Minimal service worker: no build step, no dependencies, same spirit as the
// rest of the site. Navigations go network-first (so edits show up right
// away); everything else is stale-while-revalidate, which is what lets the
// games work offline once you've opened them at least once.
const CACHE_NAME = 'denniseriksson-v1';
const BASE = '{{ site.baseurl }}';

const PRECACHE_URLS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/games/index.html',
  BASE + '/games/arcade.css',
  BASE + '/games/arcade.js',
  BASE + '/favicon.png',
  BASE + '/manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(PRECACHE_URLS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(
          names.filter(function (name) { return name !== CACHE_NAME; })
               .map(function (name) { return caches.delete(name); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  // HTML pages: try the network first, so a redeploy is visible immediately.
  // Only fall back to the cache when there is no connection at all.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || caches.match(BASE + '/index.html');
          });
        })
    );
    return;
  }

  // Everything else (CSS, JS, images): serve the cached copy instantly if
  // there is one, while refreshing it in the background for next time.
  event.respondWith(
    caches.match(req).then(function (cached) {
      const network = fetch(req).then(function (res) {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
