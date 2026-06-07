/* ============================================================
   NoteStudio — Service Worker v13
   ============================================================ */

const CACHE_NAME    = 'notestudio-v13';
const RUNTIME_CACHE = 'notestudio-runtime-v13';
const OFFLINE_URL   = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-152x152.png',
  '/sw.js',
  '/404.html',
  '/about.html',
  '/help.html',
  '/contact.html',
  '/update.html',
  '/privacy-policy.html',
  '/terms-and-conditions.html'
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

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

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (PASSTHROUGH_ORIGINS.some(o => request.url.startsWith(o))) return;

  /* External cacheable origins — stale while revalidate */
  if (CACHEABLE_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  /* Same origin — network first, cache fallback */
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirstWithCacheFallback(request));
    return;
  }
});

/* Network first — always try network, use cache only if truly offline */
async function networkFirstWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return await caches.match(OFFLINE_URL) ||
             await caches.match('/');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache  = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(r => {
    if (r && r.status === 200) cache.put(request, r.clone());
    return r;
  }).catch(() => null);
  return cached || fetchPromise;
}

self.addEventListener('sync', event => {
  if (event.tag === 'notestudio-sync') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE', timestamp: Date.now() }))
      )
    );
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'notestudio-periodic-sync') {
    event.waitUntil(
      caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE_URLS)).catch(() => {})
    );
  }
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || 'NoteStudio', {
    body: data.body || 'You have a new notification.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: { url: data.url || '/' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const c of clients) {
        if (c.url === targetUrl && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
