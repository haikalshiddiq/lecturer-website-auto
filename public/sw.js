const VERSION = "2026-11-14-aifn-iasd-1";
const SHELL_CACHE = `hicall-shell-${VERSION}`;
const DATA_CACHE = `hicall-data-${VERSION}`;
const SHELL = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => ![SHELL_CACHE, DATA_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const cacheResponse = async (cacheName, request, response) => {
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(DATA_CACHE, request, response))
        .catch(async () => (await caches.match(request)) || caches.match("/offline.html"))
    );
    return;
  }

  if (url.pathname.startsWith("/aifn/") || url.pathname.startsWith("/iasd/")) {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(DATA_CACHE, request, response))
        .catch(async () => (await caches.match(request)) || new Response("Materi belum tersimpan. Buka sekali saat online.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }))
    );
    return;
  }

  const isCanonicalData = url.pathname.startsWith("/resources/") || url.pathname.startsWith("/blog/") || url.pathname.startsWith("/expertise/");
  if (isCanonicalData) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((response) => cacheResponse(DATA_CACHE, request, response));
        if (cached) {
          event.waitUntil(network.catch(() => undefined));
          return cached;
        }
        return network;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheResponse(SHELL_CACHE, request, response)))
  );
});