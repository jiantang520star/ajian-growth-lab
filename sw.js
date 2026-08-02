const CACHE_NAME = "ajian-growth-os-pwa-v5";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./growth-data.js",
  "./manifest.webmanifest",
  "./icons/app-icon-cat-192.png",
  "./icons/app-icon-cat-512.png",
  "./icons/app-icon-cat-64.png",
  "./icons/app-icon-cat-180.png",
  "./icons/music-headphone-cat.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

const putInCache = async (request, response) => {
  if (!response || !response.ok || request.method !== "GET") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
};

const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    await putInCache(request, response);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("./index.html");
  }
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  await putInCache(request, response);
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isMediaRequest =
    request.headers.has("range") ||
    request.destination === "audio" ||
    request.destination === "video" ||
    /\.(mp3|m4a|aac|ogg|wav|flac)$/i.test(url.pathname);

  if (isMediaRequest) return;

  const isDynamicContent = request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/growth-data.js");
  event.respondWith(isDynamicContent ? networkFirst(request) : cacheFirst(request));
});
