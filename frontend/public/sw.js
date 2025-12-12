/**
 * Service Worker for LaraibCreative
 * Provides offline support, caching, and background sync
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `laraibcreative-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `laraibcreative-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `laraibcreative-images-${CACHE_VERSION}`;
const API_CACHE = `laraibcreative-api-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Cache durations (in seconds)
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60, // 1 week
  images: 30 * 24 * 60 * 60, // 30 days
  api: 5 * 60, // 5 minutes
  dynamic: 24 * 60 * 60, // 1 day
};

// API endpoints to cache
const CACHEABLE_API_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/settings/,
];

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Install error:', error);
      })
  );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old caches
              return name.startsWith('laraibcreative-') && 
                     !name.includes(CACHE_VERSION);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================
// FETCH EVENT
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin && !url.hostname.includes('cloudinary')) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different request types
  if (request.destination === 'image' || url.hostname.includes('cloudinary')) {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// ============================================
// REQUEST HANDLERS
// ============================================

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    // Return cached, but update in background
    updateCache(request, IMAGE_CACHE);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder image
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" fill="#999" text-anchor="middle" dy=".3em">Image</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Handle API requests with stale-while-revalidate strategy
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this endpoint is cacheable
  const isCacheable = CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(url.pathname));
  
  if (!isCacheable) {
    return fetch(request);
  }
  
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  
  // Start network request
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.error('[SW] API fetch error:', error);
      if (cached) {
        return cached;
      }
      throw error;
    });
  
  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    // Return cached but update in background
    networkPromise.catch(() => {}); // Handle in background
    return cached;
  }
  
  return networkPromise;
}

/**
 * Handle navigation requests with network-first strategy
 */
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful navigation responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback response
    return new Response('You are offline', {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/**
 * Handle static asset requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Static fetch error:', error);
    throw error;
  }
}

/**
 * Update cache in background
 */
async function updateCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response);
    }
  } catch (error) {
    // Silently fail background updates
  }
}

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'sync-wishlist') {
    event.waitUntil(syncWishlist());
  }
});

async function syncCart() {
  try {
    const pendingItems = await getFromIndexedDB('pending-cart');
    if (pendingItems && pendingItems.length > 0) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pendingItems }),
      });
      await clearFromIndexedDB('pending-cart');
    }
  } catch (error) {
    console.error('[SW] Cart sync error:', error);
  }
}

async function syncWishlist() {
  try {
    const pendingItems = await getFromIndexedDB('pending-wishlist');
    if (pendingItems && pendingItems.length > 0) {
      await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: pendingItems }),
      });
      await clearFromIndexedDB('pending-wishlist');
    }
  } catch (error) {
    console.error('[SW] Wishlist sync error:', error);
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
      actions: data.actions || [],
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'LaraibCreative', options)
    );
  } catch (error) {
    console.error('[SW] Push error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('laraibcreative-sw', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

function clearFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('laraibcreative-sw', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
  });
}

// Log service worker status
console.log('[SW] Service worker loaded');

