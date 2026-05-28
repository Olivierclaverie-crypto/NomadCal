const CACHE_NAME = 'nomadcal-v2';

// Fichiers à précacher au démarrage
const PRECACHE = [
  '/',
  '/index.html',
  '/Phenomena-Bold.ttf',
  '/Phenomena-Regular.ttf'
];

// Installation — précache les assets statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activation — supprime uniquement les ANCIENS caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch — Cache First pour assets, Network First pour le reste
self.addEventListener('fetch', e => {
  // CalDAV → toujours réseau, jamais de cache
  if (e.request.url.includes('/api/caldav')) return;

  // Assets statiques → Cache First
  if (e.request.destination === 'font' ||
      e.request.destination === 'style' ||
      e.request.destination === 'script') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // HTML + navigation → Network First avec fallback cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
