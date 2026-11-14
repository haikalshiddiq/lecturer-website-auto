import '../styles/aifn-pwa.css';

const PACK = 'hicall-aifn-pack-v2';
const RECEIPT = '/aifn/offline-receipt.json';
const LAST_SESSION = 'hicall-aifn-last-session-v1';
const CORE = [
  '/aifn/', '/aifn/studio', '/aifn/manifest.webmanifest',
  '/aifn/data/credit.json', '/aifn/aifn-finance.csv',
  '/aifn/aifn-labs.ipynb', '/aifn/aifn-labs.py', '/aifn/README.txt',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png',
];
const STUDIO_ALIASES = ['/aifn/studio/', '/aifn/studio?source=pwa', '/aifn/studio?resume=1', '/aifn/studio?mode=teach'];
let deferredInstall = null;
let warming = null;

function status(message, phase) {
  const output = document.getElementById('aifn-pwa-status');
  if (output) { output.textContent = message; output.setAttribute('role', 'status'); }
  document.documentElement.dataset.aifnOffline = phase;
}

function sessionNumber() {
  const value = Number(location.hash.slice(1));
  return Number.isInteger(value) && value >= 1 && value <= 16 ? value : null;
}

function rememberSession() {
  const current = sessionNumber();
  if (!current || !document.querySelector('[data-aifn-studio]')) return;
  try { localStorage.setItem(LAST_SESSION, String(current)); } catch { /* Resume is optional when device storage is disabled. */ }
}

function resumeSession() {
  let value = 1;
  try {
    const saved = Number(localStorage.getItem(LAST_SESSION));
    if (Number.isInteger(saved) && saved >= 1 && saved <= 16) value = saved;
  } catch { /* The first lesson remains accessible without storage. */ }
  return value;
}

function assetUrls() {
  const urls = new Set(CORE);
  const resources = performance.getEntriesByType('resource').map((entry) => entry.name);
  for (const node of document.querySelectorAll('script[src],link[rel="stylesheet"],link[rel="modulepreload"]')) {
    resources.push(node.getAttribute('src') || node.getAttribute('href'));
  }
  for (const candidate of resources) {
    if (!candidate) continue;
    const url = new URL(candidate, location.href);
    if (url.origin === location.origin && /^\/(?:_astro|fonts)\//.test(url.pathname)) urls.add(url.pathname + url.search);
  }
  return [...urls];
}

function dependentAssets(bytes, pathname, contentType) {
  const found = new Set();
  const add = (candidate) => {
    const url = new URL(candidate, new URL(pathname, location.origin));
    if (url.origin === location.origin && /^\/(?:_astro|fonts)\//.test(url.pathname)) found.add(url.pathname + url.search);
  };
  if (contentType.includes('text/html')) {
    const html = new DOMParser().parseFromString(new TextDecoder().decode(bytes), 'text/html');
    for (const node of html.querySelectorAll('script[src],link[rel="stylesheet"],link[rel="modulepreload"],link[rel="preload"]')) add(node.getAttribute('src') || node.getAttribute('href'));
  } else if (contentType.includes('javascript') || /\.m?js(?:\?|$)/.test(pathname)) {
    const text = new TextDecoder().decode(bytes);
    for (const match of text.matchAll(/(?:from\s*|import\s*(?:\(\s*)?)["']([^"']+\.(?:m?js|css)(?:\?[^"']*)?)["']/g)) add(match[1]);
  } else if (contentType.includes('text/css')) {
    const text = new TextDecoder().decode(bytes);
    for (const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) if (!match[1].startsWith('data:')) add(match[1]);
  }
  return [...found];
}

async function controlledWorker() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) throw new Error('Penyimpanan offline tidak didukung browser ini.');
  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker belum siap; coba lagi saat online.')), 12000)),
  ]);
  if (navigator.serviceWorker.controller) return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { navigator.serviceWorker.removeEventListener('controllerchange', done); reject(new Error('Kontrol offline belum aktif. Muat ulang lalu coba lagi.')); }, 12000);
    function done() { clearTimeout(timer); resolve(); }
    navigator.serviceWorker.addEventListener('controllerchange', done, { once: true });
  });
}

async function verifyPack() {
  if (!('caches' in window)) return false;
  const cache = await caches.open(PACK);
  const receipt = await cache.match(RECEIPT);
  if (!receipt) return false;
  const metadata = await receipt.json();
  if (!Array.isArray(metadata.urls) || assetUrls().some((url) => !metadata.urls.includes(url))) return false;
  for (const url of metadata.urls) {
    const cached = await cache.match(url);
    if (!cached || !cached.ok) return false;
  }
  return true;
}

async function prepareOffline() {
  if (warming) return warming;
  warming = (async () => {
    const button = document.getElementById('aifn-offline-prepare');
    if (button) button.disabled = true;
    status('Menyiapkan materi, data, dan notebook offline di perangkat ini…', 'preparing');
    try {
      await controlledWorker();
      const cache = await caches.open(PACK);
      const urls = assetUrls();
      const queued = new Set(urls);
      const responses = new Map();
      let cursor = 0;
      // Bound concurrent transfers instead of opening a request for every asset at once.
      await Promise.all(Array.from({ length: 3 }, async () => {
        while (cursor < urls.length) {
          const url = urls[cursor++];
          let response;
          try {
            response = await fetch(url, { cache: 'reload', signal: AbortSignal.timeout(15000) });
            if (!response.ok) throw new Error(`Materi ${url} tidak tersedia (${response.status}).`);
          } catch (error) {
            response = await cache.match(url);
            if (!response?.ok) throw error;
          }
          const headers = new Headers(response.headers);
          headers.delete('vary');
          headers.delete('content-encoding');
          headers.delete('content-length');
          const bytes = await response.arrayBuffer();
          responses.set(url, new Response(bytes, { status: 200, headers }));
          // Preparing from the overview must include the unvisited studio's script/font graph.
          for (const dependency of dependentAssets(bytes, url, headers.get('content-type') || '')) {
            if (!queued.has(dependency)) {
              if (queued.size >= 120) throw new Error('Paket terlalu besar untuk persiapan offline ringan.');
              queued.add(dependency);
              urls.push(dependency);
            }
          }
        }
      }));
      const studio = responses.get('/aifn/studio');
      for (const alias of STUDIO_ALIASES) responses.set(alias, studio.clone());
      responses.set('/aifn', responses.get('/aifn/').clone());
      // Never leave an old receipt promising that a partially replaced pack is complete.
      await cache.delete(RECEIPT);
      for (const [url, response] of responses) await cache.put(url, response);
      const retained = new Set([...responses.keys()].map((url) => new URL(url, location.origin).href));
      for (const request of await cache.keys()) if (!retained.has(request.url)) await cache.delete(request);
      const metadata = { version: 2, preparedAt: new Date().toISOString(), urls: [...responses.keys()] };
      await cache.put(RECEIPT, new Response(JSON.stringify(metadata), { headers: { 'Content-Type': 'application/json' } }));
      if (!await verifyPack()) throw new Error('Cache belum lengkap. Jangan tutup halaman; coba siapkan ulang.');
      status('Siap offline di perangkat ini: materi, grafik, data, dan unduhan notebook. Claude/Colab tetap perlu internet.', 'ready');
      window.dispatchEvent(new CustomEvent('aifn:offline-ready', { detail: { assets: metadata.urls.length } }));
      return true;
    } catch (error) {
      status(`Offline belum siap: ${error instanceof Error ? error.message : 'Penyimpanan atau jaringan gagal.'} Tombol Siapkan offline dapat dicoba lagi.`, 'error');
      return false;
    } finally {
      if (button) button.disabled = false;
      warming = null;
    }
  })();
  return warming;
}

function installationHelp(trigger) {
  let dialog = document.getElementById('aifn-install-help');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'aifn-install-help';
    dialog.className = 'af-install-dialog';
    dialog.setAttribute('aria-labelledby', 'aifn-install-title');
    dialog.innerHTML = '<h2 id="aifn-install-title">Pasang AiFn di perangkat</h2><p>Android/Chrome: buka menu browser, lalu pilih Instal aplikasi atau Tambahkan ke layar utama. Gunakan Chrome langsung, bukan browser di dalam Telegram.</p><p>iPhone/iPad: buka di Safari, ketuk Bagikan, lalu Tambahkan ke Layar Utama. Desktop: gunakan ikon instal pada bilah alamat jika browser mendukungnya.</p><p>Nama aplikasi: AiFn. Ikon memakai identitas situs dosen yang sudah ada. Instalasi tidak mengunggah progres atau catatan.</p><p>Gunakan Siapkan offline sebelum memutus koneksi. Notebook dapat diunduh offline, tetapi eksekusi Python memerlukan Jupyter/Python lokal; Colab dan Claude memerlukan internet.</p><form method="dialog"><button type="submit">Tutup panduan pemasangan</button></form>';
    document.body.append(dialog);
  }
  dialog.addEventListener('close', () => trigger?.focus(), { once: true });
  dialog.showModal();
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstall = event;
  const button = document.getElementById('aifn-install');
  if (button) button.textContent = 'Pasang AiFn';
});
window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  const button = document.getElementById('aifn-install');
  if (button) { button.textContent = 'AiFn terpasang'; button.disabled = true; }
});
window.addEventListener('hashchange', rememberSession);
window.addEventListener('aifn:ready', () => { if (navigator.onLine) void prepareOffline(); });
window.addEventListener('offline', async () => {
  status(await verifyPack() ? 'Sedang offline. Materi, data, grafik, dan notebook tersimpan di perangkat ini; Claude/Colab tidak tersedia.' : 'Sedang offline. Paket belum lengkap; beberapa materi mungkin belum tersedia.', await verifyPack() ? 'ready' : 'error');
});
window.addEventListener('online', () => { void prepareOffline(); });
document.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const install = event.target.closest('#aifn-install');
  if (install) {
    event.preventDefault();
    if (deferredInstall) {
      const prompt = deferredInstall;
      deferredInstall = null;
      try { await prompt.prompt(); await prompt.userChoice; } catch { installationHelp(install); }
    } else installationHelp(install);
  }
  if (event.target.closest('#aifn-offline-prepare')) { event.preventDefault(); void prepareOffline(); }
  if (event.target.closest('#aifn-resume')) {
    event.preventDefault();
    const target = `/aifn/studio#${resumeSession()}`;
    if (document.querySelector('[data-aifn-studio]')) location.hash = `#${resumeSession()}`;
    else location.assign(target);
  }
});

if (document.querySelector('[data-aifn-studio]')) {
  if (!location.hash && (new URLSearchParams(location.search).has('resume') || new URLSearchParams(location.search).get('source') === 'pwa')) location.hash = `#${resumeSession()}`;
  rememberSession();
}
if (matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) {
  const button = document.getElementById('aifn-install');
  if (button) { button.textContent = 'Mode aplikasi'; button.disabled = true; }
}
if (navigator.onLine) void prepareOffline();
else void verifyPack().then((ready) => status(ready ? 'Siap offline di perangkat ini. Claude/Colab tetap perlu internet.' : 'Paket offline belum lengkap. Sambungkan internet dan pilih Siapkan offline.', ready ? 'ready' : 'error'));
