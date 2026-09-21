// Minimal Service Worker to pass Chrome's PWA install criteria
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  return self.clients.claim();
});

// A simple fetch handler that passes everything through
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});
