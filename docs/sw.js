/* ============================================================
   SERVICE WORKER
   Keeps a copy of the app so it still opens with no signal —
   which for a workout app is the normal case, not the edge case.

   Two things make this different from a textbook service worker:

   1. The bundle filenames carry a content hash (index-a1b2c3d4.js),
      so they can't be listed ahead of time. The shell is precached;
      hashed assets are cached as they're requested.

   2. The app is served from the domain root on Vercel but from
      /rise-workout/ on GitHub Pages. Nothing here is hardcoded to
      either — BASE is derived from the worker's own location, so the
      same file works under both without a build step touching it.

   ⚠️ Bump CACHE when you change caching behaviour.
   ============================================================ */

const CACHE = "rise-v7";

/* "/" on Vercel, "/rise-workout/" on GitHub Pages. */
const BASE = new URL("./", self.location).pathname;

/* Only the things whose names are stable. */
const SHELL = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json",
  BASE + "icon-192.png",
  BASE + "icon-512.png",
  BASE + "icon-maskable.png",
  BASE + "apple-touch-icon.png",
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

  // Never cache the four APIs — stale weather or a stale calorie count is worse
  // than none, and the app already handles a failed request.
  if (url.origin !== self.location.origin) return;

  /* Hashed build assets are immutable: cache-first, so a repeat launch is
     instant and doesn't touch the network at all. */
  if (url.pathname.startsWith(BASE + "assets/")) {
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
        caches.match(req).then((hit) => hit || caches.match(BASE + "index.html"))
      )
  );
});
