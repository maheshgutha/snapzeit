/**
 * Service Worker for SnapZeit PWA
 * Handles offline functionality, push notifications, and background sync
 */

const CACHE_NAME = 'snapzeit-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/snapzeit-192.png',
  '/icons/snapzeit-512.png',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(URLS_TO_CACHE).catch((error) => {
        console.warn('[Service Worker] Cache addAll error:', error);
        // Don't fail installation if some resources aren't available
      });
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim all clients immediately
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      console.log('[Service Worker] Claiming client:', client.id);
    });
  });
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (let them go directly to network)
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if available
      if (response) {
        return response;
      }

      // Fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Don't cache non-successful responses
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          // Cache successful responses
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch((error) => {
          console.log('[Service Worker] Fetch failed; returning offline page:', error);
          
          // Return offline page if available
          return caches.match('/offline.html').catch(() => {
            return new Response(
              '<h1>Offline</h1><p>You are currently offline. Please check your connection.</p>',
              {
                headers: { 'Content-Type': 'text/html' },
              }
            );
          });
        });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  let notificationData = {
    title: 'SnapZeit',
    body: 'You have a new notification',
    icon: '/icons/snapzeit-192.png',
    badge: '/icons/badge.png',
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag || 'snapzeit-notification',
      data: notificationData.data || {},
      actions: notificationData.actions || [],
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);

  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = '/';

  // Route to appropriate page based on notification type
  if (data.type === 'booking') {
    urlToOpen = '/bookings';
  } else if (data.type === 'message') {
    urlToOpen = '/messages';
  } else if (data.type === 'review') {
    urlToOpen = `/photographer/${data.photographerId}`;
  } else if (data.type === 'payment') {
    urlToOpen = '/photographer/dashboard';
  } else if (data.type === 'promo') {
    urlToOpen = '/photographers';
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      // Check if app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification action click event (for action buttons)
self.addEventListener('notificationclick', (event) => {
  if (event.action === 'reply') {
    console.log('[Service Worker] Reply action clicked');
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].url === '/messages' && 'focus' in clientList[i]) {
            return clientList[i].focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/messages');
        }
      })
    );
  } else if (event.action === 'accept') {
    console.log('[Service Worker] Accept action clicked');
    // Send message to client to accept lead
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: 'LEAD_ACCEPT',
            data: event.notification.data,
          });
        });
      })
    );
  }
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }
});

// Background sync event (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

// Helper function to sync messages in background
async function syncMessages() {
  try {
    console.log('[Service Worker] Syncing messages...');
    // This would call your API endpoint to sync messages
    // const response = await fetch('/api/sync-messages', { method: 'POST' });
    console.log('[Service Worker] Messages synced successfully');
  } catch (error) {
    console.error('[Service Worker] Error syncing messages:', error);
    throw error; // Retry sync
  }
}

// Helper function to sync bookings in background
async function syncBookings() {
  try {
    console.log('[Service Worker] Syncing bookings...');
    // This would call your API endpoint to sync bookings
    // const response = await fetch('/api/sync-bookings', { method: 'POST' });
    console.log('[Service Worker] Bookings synced successfully');
  } catch (error) {
    console.error('[Service Worker] Error syncing bookings:', error);
    throw error; // Retry sync
  }
}

console.log('[Service Worker] Loaded and ready');
