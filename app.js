if ('serviceWorker' in navigator && 'SyncManager' in window){
  navigator.serviceWorker
    .register('./service-worker.js', {scope:'./'})
    .then(registration => navigator.serviceWorker.ready)
    .then(registration => {
      Notification.requestPermission();
      if (location.pathname == ("/restaurant.html")){
        document.getElementById("review-button").addEventListener("click",()=>{
            reviewHandler();
            registration.sync.register('offlinePostRequest').then(
              ()=>{
                console.log("[Sync] Success")
                location.reload;
              },
              ()=>{console.error("[Sync] Sync unsuccessful")}
            );
        })
      }
    })
    .catch(function(err){
      console.log("Service Worker failed to register", err);
    })
}
