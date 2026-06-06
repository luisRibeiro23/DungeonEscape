const CACHE_CONTROLLED_TYPES = new Set([
    "document",
    "script",
    "style",
    "image",
    "font",
    "audio",
    "worker"
]);

self.addEventListener("install", (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        request.method !== "GET" ||
        url.origin !== self.location.origin ||
        !CACHE_CONTROLLED_TYPES.has(request.destination)
    ) {
        return;
    }

    const noCacheRequest = new Request(request, {
        cache: "no-store"
    });

    event.respondWith(fetch(noCacheRequest));
});
