const CACHE_NAME = 'levelup-life-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './home.html',
  './login.html',
  './dashboard.html',
  './quests.html',
  './shop.html',
  './inventory.html',
  './achievements.html',
  './level_up.html',
  './reward.html',
  './payment.html',
  './profile.html',
  './init_game.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return caches.match('./index.html') || caches.match('./');
      });
    })
  );
});
