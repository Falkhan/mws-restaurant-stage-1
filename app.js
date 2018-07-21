if ('serviceWorker' in navigator && 'SyncManager' in window){
  navigator.serviceWorker
    .register('./service-worker.js', {scope:'./'})
    .then(registration => navigator.serviceWorker.ready)
    .then(registration => {
      Notification.requestPermission();
      if (location.pathname == ("/restaurant.html")){
        document.getElementById("review-button").addEventListener("click",()=>{
            DBHelper.reviewHandler().then(()=>{
              registration.sync.register('offlinePostRequest');
            }).catch(err=>{
              console.error(err);
            });
        })
      }
    })
    .catch(function(err){
      console.log("Service Worker failed to register", err);
    })
}
