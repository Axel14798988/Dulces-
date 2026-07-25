const CACHE_NAME = "dulceria-tere-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isStaticAsset = requestUrl.origin === self.location.origin ||
    requestUrl.hostname === "images.unsplash.com" ||
    requestUrl.hostname === "www.gstatic.com";

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const freshResponse = fetch(event.request)
        .then(response => {
          if (response.ok || response.type === "opaque") {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);

      return cached || freshResponse;
    })
  );
});
