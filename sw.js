/* ============================================================
   SERVICE WORKER
   This is a small script the browser keeps running in the
   background. Its whole job is to save copies of your files so
   the app still opens when the phone has no internet.

   ⚠️ IMPORTANT: if you change index.html and your phone keeps
   showing the old version, bump the version number below
   (v1 → v2) and push again. That's the standard fix.
   ============================================================ */

const CACHE = "rise-v2";

// The files that get saved for offline use.
// If you add a new file to your project, add it to this list too.
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png",
  "./apple-touch-icon.png"
];

// When a new version installs, save all the files.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())   // don't wait for old tabs to close
  );
});

// When the new version takes over, throw away any older caches.
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* Network first, cache second.
   We try the internet so you always get your latest changes,
   and fall back to the saved copy when there's no signal. */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save a fresh copy for next time
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        // Offline: serve what we saved earlier
        caches.match(event.request).then(hit => hit || caches.match("./index.html"))
      )
  );
});