const SW_VERSION = 'indonesia-intel-pwa-v5';
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];
const DATA_URL = '/data/news.json';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shellCache = await caches.open(SW_VERSION);
    await shellCache.addAll(APP_SHELL);

    // Vite emits hashed asset names. Discover and cache them from the built shell
    // during installation so the first visit is already offline-capable.
    const shellResponse = await shellCache.match('/index.html');
    const shellHtml = shellResponse ? await shellResponse.text() : '';
    const assetUrls = [...shellHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
    await Promise.all(assetUrls.map(async (assetUrl) => {
      try { await shellCache.add(assetUrl); } catch { /* A single optional asset must not block installation. */ }
    }));

    try {
      const dataResponse = await fetch(DATA_URL, { cache: 'no-store' });
      if (dataResponse.ok) {
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        await runtimeCache.put(DATA_URL, dataResponse);
      }
    } catch { /* The app shell remains installable when the live feed is temporarily unavailable. */ }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== SW_VERSION && key !== RUNTIME_CACHE).map((key) => caches.delete(key)));
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
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE, DATA_URL));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(cacheFirst(request, SW_VERSION));
  }
});

async function networkFirstNavigation(event) {
  const cache = await caches.open(SW_VERSION);
  try {
    const response = await fetch(event.request);
    cache.put('/index.html', response.clone());
    return response;
  } catch (error) {
    return (await cache.match('/offline.html')) || (await cache.match('/index.html'));
  }
}

async function staleWhileRevalidate(request, cacheName, cacheKey = request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(cacheKey);
  const network = fetch(request, { cache: 'no-store' })
    .then((response) => {
      if (response.ok) cache.put(cacheKey, response.clone());
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
