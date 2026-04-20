const CACHE = 'notestudio-v1';

const FILES = [
  '/NoteStudio/',
  '/NoteStudio/index.html',
  '/NoteStudio/manifest.json',
  '/NoteStudio/icon-192x192.png',
  '/NoteStudio/icon-512x512.png'
];

// Instalare — salvează fișierele în cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// Activare — șterge cache-urile vechi
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — servește din cache, fallback la rețea
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => caches.match('/NoteStudio/index.html'));
    })
  );
});
