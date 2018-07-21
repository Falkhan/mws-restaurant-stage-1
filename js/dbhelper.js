/**
 * Common database helper functions.
 */

// Open the database
 var dbPromise = idb.open('restaurant-data', 1, upgradeDB => {
     switch (upgradeDB.oldVersion) {
     case 0:
        upgradeDB.createObjectStore('restaurant');
        upgradeDB.createObjectStore('reviews');
        upgradeDB.createObjectStore('deferred-posts');
     }
 });


class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // Fetch from the internet if there's connectivity
    // And update the IDB store
    // If not, try fetching from IDB

    fetch(DBHelper.DATABASE_URL).then((response)=>{
      return response.json();
    })
    .then((data)=>{
      dbPromise.then(db=>{
        const tx = db.transaction('restaurant','readwrite');
        for (var i = 0; i<data.length; i++){
          var obj = data[i];
          tx.objectStore('restaurant').put(obj,obj.id);
        }
        return tx.complete;
      });
      callback(null, data);
    }).catch((err)=>{
      dbPromise.then(db=>{
        return db.transaction('restaurant','readwrite')
          .objectStore('restaurant').getAll();
      }).then(data =>{
        if(data.length > 0){
          callback(null,data);
        }
        else{
          callback(err,null);
        }
      });
    });


    }
/*
 The app needs to fetch all review data and then return filtered data
*/

/**
 * Fetch restaurant reviews by restaurant ID
*/

 static fetchRestaurantReviewById(id){
   return fetch("http://localhost:1337/reviews/").then((response)=>{
     return response.json();
   }).
   then((data)=>{
     // If there is connection, add reviews to the IDB and return the response from fetch
     if(data){
       dbPromise.then(db=>{
         const tx = db.transaction('reviews','readwrite');
         data.forEach((review)=>{
           tx.objectStore('reviews').put(review,review.id)
         })
         return tx.complete;
       });
       return data.filter(r => r.restaurant_id == id);
     }
   })
    // If there is no connection, grab reviews from the IDB
   .catch((err)=>{
      return dbPromise.then(db=>{
         return db.transaction('reviews','readwrite')
                  .objectStore('reviews').getAll();
         }).then(data =>{
           return data.filter(r => r.restaurant_id == id);
         });
 });
 }


 static reviewHandler() {
   const restaurant_id = parseInt(getParameterByName("id"));
   const review_text = document.getElementById("review-text").value;
   const name = document.getElementById("review-name").value;
   const rating = parseInt(document.getElementById("review-rating").value);

   const new_review = {
     "restaurant_id": restaurant_id,
     "name": name,
     "rating": rating,
     "comments": review_text
   }
   console.log("New review added");
   console.log(new_review);
 //  postNewReview(new_review).then((result) => {
 //    console.log(result);
 //  })
   //location.reload();
   return dbPromise.then(db=>{
     const tx = db.transaction('deferred-posts','readwrite');
     tx.objectStore('deferred-posts').put(new_review,1);
     return tx.complete;
   });
 }

/**
 * Set a restaurant to favourite or not

  static setFavouriteRestaurant(id){
   const restaurant_index = id - 1;

   // Create a new transaction
   dbPromise.then(db => {
     const tx = db.transaction('restaurant', 'readwrite');
     tx.objectStore('restaurant').put()
   })

  }
*/

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
