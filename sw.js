const CACHE_NAME = 'route-optimizer-pwa-v195';
const RUNTIME_CACHE = 'route-optimizer-runtime-v1';
async function cacheRuntimeResponse(cache, request, response) { await cache.put(request, response); const keys = await cache.keys(); if (keys.length > 300) await Promise.all(keys.slice(0, keys.length - 300).map((key) => cache.delete(key))); }
const APP_SHELL = [
  './', './index.html', './routes.html', './completed.html', './saved.html', './settings.html',
  './styles.css', './routes.css', './app.js', './routes.js', './completed.js',
  './manifest.json', './storage.js', './layout.js', './pwa.js', './saved.js', './settings.js', './leaflet.js', './leaflet.css', './icon-192.svg', './icon-512.svg', './ocr/tesseract.min.js', './ocr/worker.min.js', './ocr/tesseract-core.wasm.js', './ocr/tesseract-core.wasm', './ocr/lang-data/ron.traineddata.gz'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => undefined));
});
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => ![CACHE_NAME, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const externalAsset = ['unpkg.com', 'cdn.jsdelivr.net'].includes(url.hostname);
  const mapTile = url.hostname.endsWith('tile.openstreetmap.org');
  if (url.origin !== self.location.origin && !externalAsset && !mapTile) return;
  if (externalAsset || mapTile) {
    event.respondWith(caches.open(RUNTIME_CACHE).then((cache) => cache.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { cacheRuntimeResponse(cache, event.request, response.clone()); return response; }))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
















































































































