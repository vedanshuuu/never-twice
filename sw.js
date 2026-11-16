// Never Twice service worker: keeps the app working offline.
const CACHE = "never-twice-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url), own = url.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!own && !font) return;
  // Pages: network first so updates arrive, cache when offline. Everything else: cache first.
  if (own && (req.mode === "navigate" || url.pathname.endsWith("/index.html"))) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
});
