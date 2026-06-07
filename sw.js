/* ============================================================
   NoteStudio — Service Worker  (Cache-First + Network Fallback)
   v2.0 — GitHub Pages / subpath /NoteStudio
   ============================================================ */

const CACHE_NAME    = 'notestudio-v10';
const RUNTIME_CACHE = 'notestudio-runtime-v10';
const BASE          = '/NoteStudio';
const OFFLINE_URL   = `${BASE}/offline.html`;

const PRECACHE_URLS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/offline.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icon-192x192.png`,
  `${BASE}/icon-512x512.png`,
  `${BASE}/icon-152x152.png`,
  `${BASE}/sw.js`,
  `${BASE}/404.html`,
  `${BASE}/about.html`,
  `${BASE}/contact.html`,
  `${BASE}/help.html`,
  `${BASE}/update.html`
];

const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net'
];

const PASSTHROUGH_ORIGINS = [
  'https://googleads.g.doubleclick.net',
  'https://pagead2.googlesyndication.com',
  'https://adservice.google.com',
  'https://www.googletagservices.com',
  'https://tpc.googlesyndication.com',
  'https://securepubads.g.doubleclick.net',
  'https://fundingchoicesmessages.google.com'
];

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', event => {
  const keep = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  if (PASSTHROUGH_ORIGINS.some(o => request.url.startsWith(o))) return;
  if (url.protocol === 'chrome-extension:') return;

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirstWithOfflineFallback(request));
    return;
  }
  if (CACHEABLE_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }
  event.respondWith(networkFirst(request));
});

/* ── BACKGROUND SYNC ── */
self.addEventListener('sync', event => {
  if (event.tag === 'notestudio-sync') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE', timestamp: Date.now() }))
      )
    );
  }
});

/* ── PERIODIC SYNC ── */
self.addEventListener('periodicsync', event => {
  if (event.tag === 'notestudio-periodic-sync') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE_URLS)).catch(() => {})
    );
  }
});

/* ── PUSH ── */
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'NoteStudio', {
    body: data.body || 'You have a new notification.',
    icon: `${BASE}/icon-192x192.png`,
    badge: `${BASE}/icon-192x192.png`,
    data: { url: data.url || `${BASE}/` }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || `${BASE}/`;
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const c of clients) {
        if (c.url === targetUrl && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

/* ── STRATEGIES ── */

async function cacheFirstWithOfflineFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.mode === 'navigate') {
      return await caches.match(OFFLINE_URL) ||
             await caches.match(`${BASE}/`) ||
             await caches.match(`${BASE}/index.html`);
    }
    return await caches.match(`${BASE}/`) ||
           new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(r => {
    if (r && r.status === 200) cache.put(request, r.clone());
    return r;
  }).catch(() => null);
  return cached || fetchPromise;
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return await caches.match(OFFLINE_URL) ||
             new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}
