self.importScripts('js/idb.js')
var cacheName = 'v17';
var cacheFiles = [
  '/',
  '/service-worker.js',
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
  '/app.js',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/idb.js',
  '/js/restaurant_info.js',
  '/restaurant.html?id=1',
  '/restaurant.html?id=2',
  '/restaurant.html?id=3',
  '/restaurant.html?id=4',
  '/restaurant.html?id=5',
  '/restaurant.html?id=6',
  '/restaurant.html?id=7',
  '/restaurant.html?id=8',
  '/restaurant.html?id=9',
  '/restaurant.html?id=10',
  '/manifest.json'
]


self.addEventListener('install', function(e){
  console.log("[ServiceWorker] Installed")

  e.waitUntil(
    // Cache all files from the list
    caches.open(cacheName).then(function(cache){
      console.log("[ServiceWorker] Caching cacheFiles");
      return cache.addAll(cacheFiles);
    })
  )
})

// Listen for activate events
self.addEventListener('activate', function(e){
  console.log("[ServiceWorker] Activated")
  e.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(cacheNames.map(function(thisCacheName){
        if (thisCacheName !== cacheName){
          // Remove old cachefiles
          console.log("[ServiceWorker] Removing Cached Files from " + thisCacheName);
          return caches.delete(thisCacheName);

        }
      }))
    })
  )
})

// Listen for fetch events
self.addEventListener('fetch', function(e) {
  console.log("[ServiceWorker] fetching data", e.request.url);
  var req = e.request.clone();

  // Only hijack GET requests
  if (req.clone().method == "GET"){

    e.respondWith(

      // If GET, look for the request in cache
      caches.match(req).then((response)=>{
        // Send a response from cache if there is one; if not, fetch it from the web
        return response || fetch(req);

      })
    );
  }
});

// Listen for sync events
self.addEventListener('sync',function(e){
  if (e.tag === "offlinePostRequest"){
    e.waitUntil(postNewReview());
  }
});

// Send new reviews to the server
function postNewReview(){
  return getNewReview().then(data=>{
    console.log();
    if(data.length > 0){
      for (var i = 0; i<data.length; i++){
        var fetch_settings = {
          method: 'POST',
          headers:{
            'content-type': 'application/json'
          },
          body: JSON.stringify(data[i])
        };
        fetch('http://localhost:1337/reviews/', fetch_settings);
      }
      self.registration.showNotification("New review posted!");
    }
    return;
  });

}
// Get the new review from IDB
function getNewReview(){

  // Get all new reviews
  var dbPromise = idb.open('restaurant-data',1)
  return dbPromise.then(db=>{
    return db.transaction('outbox')
             .objectStore('outbox').getAll();

  }).then(data=>{

    // Clear the outbox
    dbPromise.then(db=>{
      const tx = db.transaction('outbox','readwrite');
      tx.objectStore('outbox').clear();
      return tx.complete;

    })

    return data;
  });
}
