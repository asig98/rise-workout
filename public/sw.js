/* ============================================================
   SERVICE WORKER
   Keeps a copy of the app so it still opens with no signal —
   which for a workout app is the normal case, not the edge case.

   Rewritten for the Vite build: the bundle filenames now carry a
   content hash (index-a1b2c3d4.js), so they can't be listed here
   ahead of time. Instead the shell is precached and hashed assets
   are cached as they're requested.

   ⚠️ Bump CACHE when you change caching behaviour.
   ============================================================ */

const CACHE = "rise-v6";

/* Only the things whose names are stable. */
const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Individually, so one 404 can't fail the whole install the way
      // cache.addAll() would.
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never cache the four APIs — stale weather or a stale calorie count is
  // worse than none, and the app already handles a failed request.
  if (url.origin !== self.location.origin) return;

  /* Hashed build assets are immutable: cache-first, so a repeat launch is
     instant and doesn't touch the network at all. */
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  /* Everything else: network first so a deploy shows up immediately, cache as
     the fallback, and index.html as the last resort for a navigation. */
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || caches.match("/index.html"))
      )
  );
});
