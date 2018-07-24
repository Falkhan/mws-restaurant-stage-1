let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {

  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
     fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("alt","Restaurant " +restaurant.name);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  const star = document.getElementById('star');

  // check if the restaurant was set to favourite
  if (restaurant.is_favorite == "true"){
    star.setAttribute("class","fas fa-star fav-icon");
  }
  else {
    star.setAttribute("class","far fa-star fav-icon");
  }

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();

  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {

  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = () => {
  var reviews = DBHelper.fetchRestaurantReviewById(self.restaurant.id);
  const container = document.getElementById('reviews-container');
  reviews.then((data)=>{
    if (!data){
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    else {

      // Sort reviews from the most recent one to the oldest
      data.sort((a,b)=>{
        a = new Date(a.createdAt);
        b = new Date(b.createdAt);
        return a>b ? -1 : a<b ? 1 : 0;
      });

      const ul = document.getElementById('reviews-list');
      ul.innerHTML = "";
      data.forEach(review => {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
    }
  })

}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  const aria_label = document.createAttribute("aria-label");
  aria_label.value = "Review by " + review.name;
  name.setAttributeNode(aria_label);
  name.setAttribute("tabindex","0");
  li.appendChild(name);

  const date = document.createElement('p');
  const created_at = new Date(review.createdAt)
  date.innerHTML = `${created_at.getDate()}.${created_at.getMonth()+1}.${created_at.getFullYear()}`;
  date.setAttribute("tabindex","0");
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute("tabindex","0");
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.setAttribute("tabindex","0");
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.setAttribute("href",`./restaurant.html?id=${self.restaurant.id}`);
  a.setAttribute("aria-current","page");
  a.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
  li.appendChild(a);


}


/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


starFavorize = (restaurant=self.restaurant) =>{
  const star = document.getElementById('star');
  let new_state;
  if(star.className == "fas fa-star fav-icon"){
    new_state = "false";
    star.setAttribute("class","far fa-star fav-icon");
  }
  else{
    new_state = "true";
    star.setAttribute("class","fas fa-star fav-icon");
  }

  fetch(`http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=${new_state}`,{method: 'PUT'})
    .then((response) => {
      console.log(response);
    });

}
