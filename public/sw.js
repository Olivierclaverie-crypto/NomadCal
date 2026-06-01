// NomadCal Service Worker — Offline-First Architecture
// Pattern : Cache-First assets / Stale-While-Revalidate API / Network-First HTML
// Version injectée à chaque build Vercel via vite.config.js
const CACHE_VERSION = "nomadcal-v__TIMESTAMP__";
const STATIC_CACHE  = `static-${CACHE_VERSION}`;
const API_CACHE     = `api-${CACHE_VERSION}`;

const STATIC_ASSETS = ["/", "/index.html"];

// ── Installation ──────────────────────────────────────────────────────────────
self.addEventListener("install", event => {
  console.log("[SW] Install:", CACHE_VERSION);
  self.skipWaiting(); // Active immédiatement
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// ── Activation — supprime anciens caches ──────────────────────────────────────
self.addEventListener("activate", event => {
  console.log("[SW] Activate:", CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(k => k !== STATIC_CACHE && k !== API_CACHE)
            .map(k => { console.log("[SW] Delete cache:", k); return caches.delete(k); })
        )
      ),
    ])
  );
});

// ── Fetch — 3 stratégies selon le type de requête ────────────────────────────
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // ── 1. CalDAV API → Network-First avec timeout 3s + fallback cache ────────
  if (url.pathname.startsWith("/api/caldav")) {
    event.respondWith(networkFirstWithTimeout(event.request, API_CACHE, 3000));
    return;
  }

  // ── 2. Feedback API → Network only (pas de cache) ─────────────────────────
  if (url.pathname.startsWith("/api/feedback")) {
    return; // Laisse passer sans cache
  }

  // ── 3. Assets JS/CSS (hash Vite) → Cache-First immuables ─────────────────
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // ── 4. HTML/Navigation → Network-First pour toujours avoir la dernière version
  if (event.request.mode === "navigate" ||
      url.pathname === "/" ||
      url.pathname === "/index.html" ||
      !url.pathname.includes(".")) {
    event.respondWith(networkFirstHTML(event.request));
    return;
  }

  // ── 5. Reste → Network avec fallback cache ────────────────────────────────
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ── Stratégie 1 : Network-First avec timeout ──────────────────────────────────
async function networkFirstWithTimeout(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Lance le fetch avec timeout
  const fetchPromise = fetch(request.clone()).then(response => {
    if (response.ok) {
      cache.put(request, response.clone()); // Met à jour le cache
    }
    return response;
  }).catch(() => null);

  const timeoutPromise = new Promise(resolve =>
    setTimeout(() => resolve(null), timeoutMs)
  );

  const result = await Promise.race([fetchPromise, timeoutPromise]);

  // Réseau ok → retourne la réponse fraîche
  if (result) return result;

  // Timeout ou erreur → fallback cache
  if (cached) return cached;

  // Pas de cache → erreur réseau propre
  return new Response(JSON.stringify({ error: "Hors ligne", offline: true }), {
    status: 503,
    headers: { "Content-Type": "application/json" }
  });
}

// ── Stratégie 2 : Cache-First pour assets immuables ──────────────────────────
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

// ── Stratégie 3 : Network-First pour HTML ─────────────────────────────────────
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

// ── Message SKIP_WAITING depuis l'app ─────────────────────────────────────────
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
