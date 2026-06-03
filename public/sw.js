// NomadCal Service Worker — Network-safe
// Cache uniquement les assets statiques. JAMAIS les API (toujours réseau direct).
// Version FIXE — à incrémenter manuellement à chaque correction majeure du SW.
const CACHE_VERSION = "nomadcal-v4-20260603";
const STATIC_CACHE  = `static-${CACHE_VERSION}`;

const STATIC_ASSETS = ["/", "/index.html"];

// ── Installation ──────────────────────────────────────────────────────────────
self.addEventListener("install", event => {
  console.log("[SW] Install:", CACHE_VERSION);
  self.skipWaiting(); // Active immédiatement
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)).catch(()=>{})
  );
});

// ── Activation — supprime TOUS les anciens caches ────────────────────────────
self.addEventListener("activate", event => {
  console.log("[SW] Activate:", CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(k => k !== STATIC_CACHE)
            .map(k => { console.log("[SW] Delete cache:", k); return caches.delete(k); })
        )
      ),
    ])
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // ── 1. TOUTES les API → réseau direct, JAMAIS interceptées par le SW ──────
  // (CalDAV, feedback, etc.) — le SW ne touche à rien côté serveur
  if (url.pathname.startsWith("/api/")) {
    return; // Pas de respondWith → le navigateur fait son fetch normal
  }

  // ── 2. Assets JS/CSS hashés par Vite → Cache-First (noms uniques par build)
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // ── 3. HTML / navigation → Network-First (toujours la dernière version) ───
  if (event.request.mode === "navigate" ||
      url.pathname === "/" ||
      url.pathname === "/index.html" ||
      !url.pathname.includes(".")) {
    event.respondWith(networkFirstHTML(event.request));
    return;
  }

  // ── 4. Reste → réseau avec fallback cache ─────────────────────────────────
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ── Cache-First pour assets immuables (noms hashés) ──────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

// ── Network-First pour HTML ───────────────────────────────────────────────────
async function networkFirstHTML(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match("/index.html");
    return cached || new Response("Hors ligne", { status: 503 });
  }
}

// ── Message SKIP_WAITING ──────────────────────────────────────────────────────
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
