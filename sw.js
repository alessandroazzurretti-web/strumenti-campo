// Strumenti in campo · service worker.
// CACHE è l'unica fonte della versione: le pagine la leggono con GET_VERSION.
const CACHE = 'strumenti-1.13.3';
const ASSETS = [
  './',
  './index.html',
  './schemi-blocchi.html',
  './calcolo-dosi.html',
  './taratura.html',
  './bbch.html',
  './pwa.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  // cache: 'reload' salta la cache HTTP del browser e della CDN: senza, capita
  // di installare una versione nuova del worker con dentro pagine vecchie,
  // e l'app dichiara una versione che non corrisponde a quello che mostra.
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(ASSETS.map(url =>
        fetch(new Request(url, { cache: 'reload' }))
          .then(res => (res && res.ok) ? c.put(url, res) : null)
      ))
    )
  );
  // niente skipWaiting automatico: decide la pagina, secondo l'impostazione
  // "Aggiornamenti automatici" scelta dall'utente
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'GET_VERSION' && e.ports && e.ports[0]) {
    e.ports[0].postMessage({ version: CACHE });
  }
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first con aggiornamento in background (stale-while-revalidate).
// I font vengono messi in cache al primo uso: dopo, tutto offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
