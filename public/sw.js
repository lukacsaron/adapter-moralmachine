var version = "v3" // increase for new version
var staticCacheName = version + "_pwa-static";
var dynamicCacheName = version + "_pwa-dynamic";

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('my-cache').then(cache => {
            return cache.addAll([
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    if (!cacheName.startsWith(staticCacheName) &&
                        !cacheName.startsWith(dynamicCacheName)) {
                        return true;
                    }
                }).map(function(cacheName) {
                    // completely deregister for ios to get changes too
                    console.log('deregistering Serviceworker')
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            registrations.map(r => {
                                r.unregister()
                            })
                        })
                        window.location.reload(true)
                    }

                    console.log('Removing old cache.', cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
});