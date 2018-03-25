var cacheName = 'v2';
var cacheFiles = [
  '/',
  '/data/restaurants.json',
  '/index.html',
  '/restaurant.html',
  'https://fonts.googleapis.com/css?family=Open+Sans',
  '/css/styles.css',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
  '/js/app.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js'
]


self.addEventListener('install', function(e){
  console.log("[ServiceWorker] Installed")

  e.waitUntil(
    caches.open(cacheName).then(function(cache){
      console.log("[ServiceWorker] Caching cacheFiles");
      return cache.addAll(cacheFiles);
    })
  )
})

self.addEventListener('activate', function(e){
  console.log("[ServiceWorker] Activated")
  e.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(cacheNames.map(function(thisCacheName){
        if (thisCacheName !== cacheName){
          console.log("[ServiceWorker] Removing Cached Files from " + thisCacheName);
          return caches.delete(thisCacheName);

        }
      }))
    })
  )
})

self.addEventListener('fetch', function(e){
  console.log("[ServiceWorker] Fetching", e.request.url);

  e.respondWith(

    caches.match(e.request)

      .then(function(response){
        if(response){
          console.log("[ServiceWorker] found in cache", e.request.url, response);
          return response;
        }

        var requestClone = e.request.clone();
        fetch(requestClone)
          .then(function(response){
            if (!response){
              console.log("[ServiceWorker] No response from fetch");
              return response;
              }
            var responseClone = response.clone();

            caches.open(cacheName).then(function(cache){

              console.log("[ServiceWorker] New Data", e.request.url);
              cache.put(e.request, responseClone);
              return response;

            }); // end open caches
          }).catch(function(err){
              console.log("[ServiceWorker] Error fetching & caching new data", err);
            });
        }) // end match
  ); // end e.respondWith
});
