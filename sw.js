const CACHE_NAME = 'pdr-patrol-v1'
const urlsToCache = [
	'/',
	'/index.html',
	'https://ext.same-assets.com/3382426661/3208129234.svg',
	'https://ext.same-assets.com/3382426661/2544384351.svg',
	'https://ext.same-assets.com/3382426661/817957783.jpeg',
	'https://ext.same-assets.com/3382426661/1471173443.webp',
	'https://ext.same-assets.com/3382426661/2584996207.webp',
	'https://ext.same-assets.com/3382426661/855794787.png',
]

// Install event - cache static assets
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log('Opened cache')
			return cache.addAll(urlsToCache)
		})
	)
	self.skipWaiting()
})

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => {
			// Return cached version or fetch from network
			if (response) {
				return response
			}

			// Clone the request because it's a stream
			const fetchRequest = event.request.clone()

			return fetch(fetchRequest).then(response => {
				// Check if valid response
				if (!response || response.status !== 200 || response.type !== 'basic') {
					return response
				}

				// Clone the response because it's a stream
				const responseToCache = response.clone()

				caches.open(CACHE_NAME).then(cache => {
					cache.put(event.request, responseToCache)
				})

				return response
			})
		})
	)
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== CACHE_NAME) {
						console.log('Deleting old cache:', cacheName)
						return caches.delete(cacheName)
					}
				})
			)
		})
	)

	return self.clients.claim()
})

// Handle offline scenarios
self.addEventListener('fetch', event => {
	if (event.request.destination === 'document') {
		event.respondWith(
			caches.match(event.request).then(response => {
				return response || caches.match('/index.html')
			})
		)
	}
})
