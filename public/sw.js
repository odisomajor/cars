const CACHE_NAME = 'kenya-car-marketplace-v2'
const STATIC_CACHE = 'static-v2'
const DYNAMIC_CACHE = 'dynamic-v2'
const IMAGE_CACHE = 'images-v2'
const API_CACHE = 'api-v2'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/cars',
  '/hire',
  '/search',
  '/sell',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/offline',
  '/manifest.json',
  '/favicon.ico'
]

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  '/api/cars',
  '/api/rentals',
  '/api/makes',
  '/api/models'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log('[SW] Preparing API cache')
        return Promise.resolve()
      })
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with fallback
    event.respondWith(handleApiRequest(request))
  } else if (request.destination === 'image') {
    // Images - Cache First with network fallback
    event.respondWith(handleImageRequest(request))
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Next.js static assets - Cache First
    event.respondWith(handleStaticAssets(request))
  } else {
    // Pages and other resources - Stale While Revalidate
    event.respondWith(handlePageRequest(request))
  }
})

// Handle image requests with Cache First strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to fetch image:', request.url)
    // Return placeholder image for failed image requests
    return caches.match('/images/placeholder-car.jpg') || 
           new Response('', { status: 404 })
  }
}

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed for API, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    // Return offline response for API failures
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No network connection' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle static assets with Cache First strategy
async function handleStaticAssets(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url)
    return new Response('', { status: 404 })
  }
}

// Handle page requests with Stale While Revalidate strategy
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Always try to fetch from network
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => null)
  
  // Return cached response immediately if available
  if (cachedResponse) {
    networkPromise // Update cache in background
    return cachedResponse
  }
  
  // Wait for network response if no cache
  try {
    const networkResponse = await networkPromise
    if (networkResponse) {
      return networkResponse
    }
  } catch (error) {
    console.log('[SW] Network failed for page:', request.url)
  }
  
  // Return offline page as fallback
  return caches.match('/offline') || 
         new Response('Offline', { status: 503 })
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Background sync function
async function doBackgroundSync() {
  console.log('[SW] Performing background sync...')
  // Implement background sync logic here
  // For example, sync offline form submissions, analytics, etc.
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Kenya Car Marketplace', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})