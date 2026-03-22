const CACHE = 'daarvi-shell-v1'
const PRECACHE = ['/']

// ─── Install: pre-cache the app shell ────────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE))
  )
})

// ─── Activate: purge old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

// ─── Fetch: network-first for API, cache-first for statics ───────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET
  if (request.method !== 'GET') return

  // Skip API calls — always go to network.
  // Cross-origin requests (e.g. Render backend in production) and any
  // path starting with /api are passed straight through.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api')) return

  // Navigation requests (HTML): network first, fall back to shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    )
    return
  }

  // Static assets: cache first, then network + cache
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
        }
        return response
      })
    })
  )
})
