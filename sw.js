const cacheName = 'buscaTel-v1';
const assets = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/alarma.mp3'
];

// Instalar y guardar en caché
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(assets))
  );
});

// Interceptar peticiones y servir desde caché
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});