// Yusra Synthetic Intelligence — service worker
//
// Strategy:
// - /api/* : never cached, network only. Chat/auth/payment data must always be fresh.
// - App shell (/, /assets/app.js, /assets/app.css, runtime-config.js): network-first
//   with a short timeout, falling back to cache. This build doesn't content-hash
//   filenames, so cache-first here would risk serving stale JS after every deploy —
//   network-first keeps normal loads fresh while still giving an offline fallback.
// - Static assets (icons, fonts, images): cache-first, they rarely change.
//
// Bump CACHE_VERSION on any change to this file's caching behavior so old caches
// get cleared on activate.
const CACHE_VERSION = 'yusra-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const NETWORK_TIMEOUT_MS = 3000;

const SHELL_URLS = ['/', '/assets/app.js', '/assets/app.css', '/runtime-config.js'];
const STATIC_PATTERNS = [/\.(png|jpg|jpeg|svg|webp|ico)$/, /\/fonts\//, /^https:\/\/fonts\.(googleapis|gstatic)\.com\//];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isStaticAsset(url) {
  return STATIC_PATTERNS.some((pattern) => pattern.test(url.href) || pattern.test(url.pathname));
}

function isShellRequest(url, request) {
  return SHELL_URLS.includes(url.pathname) || request.mode === 'navigate';
}

async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const networkPromise = fetch(request);
    const response = timeoutMs
      ? await Promise.race([
          networkPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
        ])
      : await networkPromise;
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Navigation fallback: serve the last-known shell so the app still boots offline.
    if (request.mode === 'navigate') {
      const shellFallback = await cache.match('/');
      if (shellFallback) return shellFallback;
    }
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // never intercept mutating requests

  const url = new URL(request.url);

  if (isApiRequest(url)) return; // network only, let the browser handle it natively

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isShellRequest(url, request)) {
    event.respondWith(networkFirst(request, SHELL_CACHE, NETWORK_TIMEOUT_MS));
  }
});
