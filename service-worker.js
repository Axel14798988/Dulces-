const CACHE_NAME = "dulceria-tere-v3";
const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./js/config.js"
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

  // Estrategia Stale-While-Revalidate:
  // Responde con el caché si está disponible (rápido), y luego actualiza el caché en segundo plano con la respuesta de la red.
  // Si no está en caché, espera a la red.
  event.respondWith(caches.open(CACHE_NAME).then(cache => {
    return cache.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Si la respuesta de red es válida, la guardamos en caché para la próxima vez.
        if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      });

      // Devuelve la respuesta del caché inmediatamente si existe, si no, espera la respuesta de la red.
      return cachedResponse || fetchPromise;
    });
  }));
});
