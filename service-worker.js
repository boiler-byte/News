const CACHE_NAME = 'news-v4-app-shell';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './assets/newsstand.webp',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.webmanifest',
  './js/app.js',
  './js/catalog.js',
  './js/feed-format.js',
  './js/feed-reader.js',
  './js/feedsearch.js',
  './js/favicon.js',
  './js/icons.js',
  './js/storage.js',
  './js/ui.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('news-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // External feeds and Feedsearch are fetched normally; don't cache responses
  // from a third-party service or attempt to synthesize offline articles here.
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.href.startsWith(self.registration.scope)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () =>
        (await caches.match(request, { ignoreSearch: true })) ||
        caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
