'use strict';
// *** REQUIRES
const axios = require('axios');
let cache = require('./cache.js');

// ******** Global Variables
let restaurantData = {};

async function getRestaurants(request, response) {
  // http://localhost:3001/restaurants?lat=47.6038321&lon=-122.330062


  try {
    let lat = request.query.lat;
    let lon = request.query.lon;

    // Try cache first
    let key = `${lat}${lon}}Restaurants`;

    if (cache[key] && ((Date.now() - cache[key].timeStamp) < 14400000)) {
      console.log('good cache restaurant data');
      restaurantData = cache[key].data;
    }

    // Bad cache data.  Call API
    else {
      console.log('bad cache restaurant data');
      let url = 'https://api.yelp.com/v3/businesses/search';

      const config = {
        headers: { 'Authorization': `Bearer ${process.env.YELP_API_KEY}` },
        params: {
          term: 'restaurants',
          latitude: lat,
          longitude: lon,
        }
      };

      let dataToGroom;
      dataToGroom = await axios.get(url, config);
      dataToGroom = dataToGroom.data.businesses;

      restaurantData.restaurants = dataToGroom.map((element) => {
        return new Restaurants(element);
      });

      restaurantData.show = 'block';
      restaurantData.error = false;
      restaurantData.errorMessage = '';
      restaurantData.errorCode = '';
      restaurantData.timeStamp = Date.now();

      // Cache results from API call
      cache[key] = {
        data: restaurantData,
        timeStamp: restaurantData.timeStamp,
      };
    }

    response.status(200).send(restaurantData);
    console.log(cache);

  } catch (error) {
    restaurantData.restaurants = [];
    restaurantData.show = 'none';
    restaurantData.error = true;
    restaurantData.errorMessage = error.message;
    restaurantData.errorCode = error.response.status;
    response.status(error.response.status).send(restaurantData);
  }
}

// ********* Class objects
let Restaurants = class {
  constructor(dataObj) {
    this.name = dataObj.name;
    this.image_url = dataObj.image_url;
    this.rating = dataObj.rating;
    this.phone = dataObj.display_phone;
    this.url = dataObj.url;
  }
};

module.exports = getRestaurants;
