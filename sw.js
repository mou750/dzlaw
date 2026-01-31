
// Service Worker محسن للموبايل
const CACHE_NAME = 'algerian-law-mobile-v2.3.0';
const OFFLINE_FALLBACK = '/index.html';

// ملفات مهمة للتخزين المسبق
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .catch(err => console.log('Cache addAll failed:', err))
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // حذف الكاشات القديمة
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// استراتيجية التخزين المحسنة للموبايل
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات الخارجية
  if (url.origin !== location.origin) {
    return;
  }

  // Network First للصفحات
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // تخزين نسخة محدثة
          const cache = caches.open(CACHE_NAME);
          cache.then(c => c.put(OFFLINE_FALLBACK, response.clone()));
          return response;
        })
        .catch(() => {
          return caches.match(OFFLINE_FALLBACK);
        })
    );
    return;
  }

  // Cache First للأصول الثابتة
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) {
            // تحديث في الخلفية
            fetch(request).then(response => {
              if (response.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, response.clone());
                });
              }
            }).catch(() => {});
            return cached;
          }
          return fetch(request).then(response => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, response.clone());
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Network First للباقي
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// دعم تحديث التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
