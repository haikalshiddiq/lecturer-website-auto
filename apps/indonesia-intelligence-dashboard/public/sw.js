const SW_VERSION = 'indonesia-intel-pwa-v8';
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;
const APP_SHELL = [
  '/',
  '/index.html',
  '/weekly/',
  '/weekly/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];
const DATA_URLS = ['/data/news.json', '/data/weekly.json', '/data/weekly/index.json'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shellCache = await caches.open(SW_VERSION);
    await shellCache.addAll(APP_SHELL);

    // Vite emits hashed asset names. Discover and cache them from the built shell
    // during installation so the first visit is already offline-capable.
    const shellResponses = await Promise.all(['/index.html', '/weekly/index.html'].map(path => shellCache.match(path)));
    const shellHtml = (await Promise.all(shellResponses.filter(Boolean).map(response => response.text()))).join('\n');
    const assetUrls = [...new Set([...shellHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]))];
    await Promise.all(assetUrls.map(async (assetUrl) => {
      try { await shellCache.add(assetUrl); } catch { /* A single optional asset must not block installation. */ }
    }));

    try {
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      await Promise.all(DATA_URLS.map(async dataUrl => {
        const dataResponse = await fetch(dataUrl, { cache: 'no-store' });
        if (dataResponse.ok) await runtimeCache.put(dataUrl, dataResponse);
      }));
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

  if (DATA_URLS.includes(url.pathname) || url.pathname.startsWith('/data/weekly/')) {
    // News freshness is more important than an instant stale response. Always
    // try the network first and use the last verified payload only when offline.
    event.respondWith(networkFirstData(request, RUNTIME_CACHE, url.pathname));
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(cacheFirst(request, SW_VERSION));
  }
});

async function networkFirstNavigation(event) {
  const cache = await caches.open(SW_VERSION);
  const requestPath = new URL(event.request.url).pathname;
  const cacheKey = requestPath.startsWith('/weekly') ? '/weekly/index.html' : '/index.html';
  try {
    const response = await fetch(event.request);
    cache.put(cacheKey, response.clone());
    return response;
  } catch (error) {
    const offline = await cache.match('/offline.html');
    if (offline) {
      return new Response(await offline.text(), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' }
      });
    }
    return cache.match(cacheKey);
  }
}

async function networkFirstData(request, cacheName, cacheKey = request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(cacheKey);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response.ok) await cache.put(cacheKey, response.clone());
    return response;
  } catch {
    return cached || new Response(JSON.stringify({ error: 'Data unavailable offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}
