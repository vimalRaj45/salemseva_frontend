// Shazu One Progressive Web App Service Worker (v1.0.0)
const CACHE_NAME = 'Shazu One-core-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install: Cache critical offline app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Remove outdated caches and take immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET requests (POST/PUT/PATCH/DELETE pass directly through)
  if (req.method !== 'GET') {
    return;
  }

  // Ignore non-HTTP/HTTPS schemes (e.g. chrome-extension://, capacitor://, data:)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. API requests: Network-first strategy with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({
                success: false,
                offline: true,
                message: 'You are currently offline. Actions will sync when connection returns.'
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // 2. Navigation requests: Network first, fallback to cached index.html for SPA
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = (await caches.match('/index.html')) || (await caches.match('/'));
          if (cached) return cached;
          return new Response(
            '<!DOCTYPE html><html><head><title>Offline - Shazu One</title></head><body><h2>Offline</h2><p>Please check your internet connection and refresh.</p></body></html>',
            {
              status: 200,
              headers: new Headers({ 'Content-Type': 'text/html' })
            }
          );
        })
    );
    return;
  }

  // 3. Static assets & media: Stale-while-revalidate strategy
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => cachedRes || new Response('', { status: 408, statusText: 'Request Timeout' }));

      return cachedRes || fetchPromise;
    })
  );
});

// Direct client message listener to trigger system notifications reliably in PWA
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    event.waitUntil(self.registration.showNotification(title || 'Shazu One', options || {}));
  }
});

// Push notification listener (Background VoIP call & dispatch notifications)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const isCall = payload.type === 'call' || payload.type === 'VOIP_INCOMING_CALL';
    const isNewJob = payload.type === 'new_job';

    let actions = [];
    if (isCall) {
      actions = [
        { action: 'answer', title: 'Answer Call' },
        { action: 'decline', title: 'Decline' }
      ];
    } else if (isNewJob) {
      actions = [
        { action: 'view_job', title: 'View & Accept' }
      ];
    }

    const options = {
      body: payload.body || 'Shazu One Service Notification',
      icon: '/icons/icon-192x192.png',
      badge: '/favicon.png',
      tag: isCall ? `call-${payload.bookingId || Date.now()}` : `notif-${Date.now()}`,
      renotify: true,
      requireInteraction: isCall || isNewJob,
      silent: false,
      timestamp: Date.now(),
      vibrate: isCall 
        ? [500, 200, 500, 200, 500, 1000, 500, 200, 500, 200, 500, 1000, 500, 200, 500] 
        : [200, 100, 200],
      actions: actions,
      data: {
        url: payload.url || (payload.role === 'customer' ? `/track?bookingId=${payload.bookingId}` : '/partner'),
        bookingId: payload.bookingId,
        type: payload.type || 'info',
        role: payload.role
      }
    };

    event.waitUntil(self.registration.showNotification(payload.title || 'Shazu One', options));
  } catch (_) {}
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  let targetUrl = notifData.url || '/';

  if (event.action === 'answer' && notifData.bookingId) {
    targetUrl = notifData.role === 'customer'
      ? `/track?bookingId=${notifData.bookingId}&autoAnswer=true`
      : `/partner?bookingId=${notifData.bookingId}&autoAnswer=true`;
  } else if (event.action === 'decline' && notifData.bookingId) {
    // Send decline beacon
    fetch(`/api/v1/webrtc/call/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: notifData.bookingId, role: notifData.role || 'technician' })
    }).catch(() => {});
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
