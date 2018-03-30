if ('serviceWorker' in navigator){
  navigator.serviceWorker
    .register('./service-worker.js', {scope:'./'})
    .then(function(registration){
      console.log("Service Worker registered", registration);
    })
    .catch(function(err){
      console.log("Service Worker failed to register", err);
    })
}
