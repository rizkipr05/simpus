const CACHE_NAME = "simpus-offline-v2";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.svg",
  "/icon-512.svg",
  "/assets/index.js",
  "/assets/index.css",
  "/assets/db.js",
];

function isAppAssetRequest(requestUrl) {
  return requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith("/assets/");
}

function isAppShellRequest(request) {
  return request.mode === "navigate";
}

function isBypassedRequest(requestUrl) {
  return (
    requestUrl.origin === self.location.origin &&
    (requestUrl.pathname.startsWith("/api/") || requestUrl.pathname.startsWith("/couchdb/"))
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (isBypassedRequest(requestUrl)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isAppShellRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/", cloned));
          return response;
        })
        .catch(async () => (await caches.match("/")) || caches.match("/index.html"))
    );
    return;
  }

  if (isAppAssetRequest(requestUrl) || APP_SHELL.includes(requestUrl.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const cloned = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
  }
});
