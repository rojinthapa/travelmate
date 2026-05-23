// TravelMate — Service Worker (sw.js)
// Serve from root: Flask route @app.route('/sw.js')

const CACHE_NAME   = 'travelmate-v4';
const OFFLINE_PAGE = '/offline';   // served by Flask

// Everything that makes the app usable without internet
const APP_SHELL = [
  '/',
  '/chat',
  '/budget',
  '/dashboard',
  '/static/style.css',
  '/static/script.js',
  '/static/currency.js',
  '/static/marked.min.js',
];

// Install: pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

//Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

//Fetch: route-based strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. AI Chat API — always go to network (Gemini needs internet)
  //    Return a friendly offline JSON if network fails
  if (url.pathname === '/api/chat') {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({
            response:
              "✈️ **TravelMate is offline right now.**\n\n" +
              "The AI assistant needs an internet connection. " +
              "Everything else — Budget Calculator, Currency Converter, " +
              "and Destination Browse — still works offline!\n\n" +
              "Reconnect to chat with your AI travel companion. 🌍"
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // 2. External APIs (weather, currency live rates) — network with silent fallback
  if (!url.origin.includes(self.location.origin)) {
    event.respondWith(
      fetch(request).catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  // 3. App shell routes + static files — Cache First, then network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      // Not cached yet — fetch and store for next time
      return fetch(request)
        .then(response => {
          // Only cache valid same-origin responses
          if (
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // HTML pages: serve the offline fallback page
          if (request.headers.get('Accept')?.includes('text/html')) {
            return caches.match('/offline') ||
              new Response('<h2>You are offline</h2>', {
                headers: { 'Content-Type': 'text/html' }
              });
          }
          return new Response('', { status: 503 });
        });
    })
  );
});
