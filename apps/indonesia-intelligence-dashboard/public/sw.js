const SW_VERSION = 'indonesia-intel-pwa-v2';
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon.svg'
];
const DATA_URL = '/data/news.json';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SW_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== SW_VERSION && key !== RUNTIME_CACHE).map((key) => caches.delete(key)));
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }

  if (url.pathname === DATA_URL) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(cacheFirst(request, SW_VERSION));
  }
});

async function networkFirstNavigation(event) {
  const cache = await caches.open(SW_VERSION);
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      cache.put('/index.html', preload.clone());
      return preload;
    }
    const response = await fetch(event.request);
    cache.put('/index.html', response.clone());
    return response;
  } catch (error) {
    return (await cache.match('/index.html')) || (await cache.match('/offline.html'));
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request, { cache: 'no-store' })
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
