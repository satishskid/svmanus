/**
 * Service Worker for SKIDS EYEAR Admin Portal
 * Enables offline functionality and background sync
 */

const CACHE_NAME = 'skids-eyear-admin-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the new response (for non-API calls)
        if (!request.url.includes('/api/')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});

// Background sync for queued uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      (async () => {
        try {
          // Trigger sync through IndexedDB
          const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('SKIDS_EYEAR_ADMIN');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });

          // Check for pending items and sync
          const tx = db.transaction(['sync_queue'], 'readonly');
          const store = tx.objectStore('sync_queue');
          const index = store.index('status');

          const pendingItems = await new Promise((resolve, reject) => {
            const request = index.getAll('pending');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });

          // Notify all clients about sync
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'SYNC_STATUS',
                pendingItems: pendingItems.length,
              });
            });
          });
        } catch (error) {
          console.error('Background sync failed:', error);
          throw error;
        }
      })()
    );
  }
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Periodic sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(
        (async () => {
          try {
            // Perform periodic sync
            console.log('Performing periodic sync');
          } catch (error) {
            console.error('Periodic sync failed:', error);
            throw error;
          }
        })()
      );
    }
  });
}
