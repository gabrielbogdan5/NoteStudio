/* ============================================================
   NoteStudio — Service Worker  (Cache-First + Network Fallback)
   ============================================================ */

const CACHE_NAME    = 'notestudio-v2';
const RUNTIME_CACHE = 'notestudio-runtime-v2';

/* ── Files that MUST be cached at install time ── */
const PRECACHE_URLS = [
  '/NoteStudio/',
  '/NoteStudio/index.html',
  '/NoteStudio/manifest.json',
  '/NoteStudio/icon-192x192.png',
  '/NoteStudio/icon-512x512.png'
];

/* ── External origins we want to cache at runtime ── */
const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net'
];

/* ── Origins we must NEVER intercept (ads, analytics) ── */
const PASSTHROUGH_ORIGINS = [
  'https://googleads.g.doubleclick.net',
  'https://pagead2.googlesyndication.com',
  'https://adservice.google.com',
  'https://www.googletagservices.com',
  'https://tpc.googlesyndication.com',
  'https://securepubads.g.doubleclick.net',
  'https://fundingchoicesmessages.google.com'
];

/* ──────────────────────────────────────────────
   INSTALL — pre-cache all shell assets
   ────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ──────────────────────────────────────────────
   ACTIVATE — delete old caches
   ────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  const keep = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !keep.includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ──────────────────────────────────────────────
   FETCH — routing logic
   ────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* 1. Non-GET requests → always go to network */
  if (request.method !== 'GET') return;

  /* 2. Ad / analytics origins → pass through, never cache */
  if (PASSTHROUGH_ORIGINS.some(o => request.url.startsWith(o))) return;

  /* 3. Chrome extensions → ignore */
  if (url.protocol === 'chrome-extension:') return;

  /* 4. App shell (same origin) → Cache-First */
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  /* 5. Cacheable external origins (fonts, CDN) → Stale-While-Revalidate */
  if (CACHEABLE_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  /* 6. Everything else → Network-First with offline fallback */
  event.respondWith(networkFirst(request));
});

/* ──────────────────────────────────────────────
   STRATEGIES
   ────────────────────────────────────────────── */

/** Cache-First: serve from cache; if missing, fetch + store */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    /* Offline and not in cache → return app shell */
    return caches.match('/NoteStudio/') ||
           caches.match('/NoteStudio/index.html');
  }
}

/** Stale-While-Revalidate: serve cache immediately, update in background */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise;
}

/** Network-First: try network; on failure fall back to cache */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
