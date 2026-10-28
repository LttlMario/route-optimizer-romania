const CACHE_NAME = 'optimizator-static-v98';
const STATIC_ASSETS = [
  '/optimizator/index.html',
  '/optimizator/styles.css',
  '/optimizator/access.css',
  '/optimizator/app.js',
  '/optimizator/core.mjs',
  '/optimizator/memory.mjs',
  '/optimizator/offline.mjs',
  '/optimizator/offline-data/devon-road-graph.json.gz',
  '/optimizator/offline-data/devon-roads-preview.json.gz',
  '/optimizator/manifest.json',
  '/leaflet.js',
  '/leaflet.css',
  '/ocr/tesseract.min.js',
  '/ocr/worker.min.js',
  '/ocr/tesseract-core.wasm.js',
  '/ocr/tesseract-core.wasm',
  '/ocr/lang-data/ron.traineddata.gz',
  '/ocr/lang-data/eng.traineddata.gz',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && (request.url.includes('/optimizator/') || request.url.endsWith('/leaflet.js') || request.url.endsWith('/leaflet.css') || request.url.includes('/ocr/'))) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});

