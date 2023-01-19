'use strict';
// *** REQUIRES
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { response } = require('express');
const axios = require('axios');

// Start express
const app = express();

// *** MIDDLEWARE
app.use(cors());

// *** DEFINE PORT
const PORT = process.env.PORT || 3002;

// ******** Global Variables
let city;
let locationData = {};
let weatherData = {
  forecast: [],
};
let movieData = {};


// *** ENDPOINTS
// ***** Base endpoint - proof of life
// 1st argument: '/' is the endpoint
// 2nd argument: callback function with request and response as parameters
app.get('/', (request, response) => {
  response.status(200).send('Welcome to my server');
});

app.get('/location', async (request, response, next) => {
  // http://localhost:3001/location?city=Seattle
  try {
    city = request.query.city;

    let url = `https://us1.locationiq.com/v1/search?key=${process.env.LOCATIONIQ_API_KEY}&limit=1&format=json&q=${city}`;

    let dataToGroom = await axios.get(url);
    locationData.lat = dataToGroom.data[0].lat;
    locationData.lon = dataToGroom.data[0].lon;
    locationData.display_name = dataToGroom.data[0].display_name;
    locationData.mapUrl = `https://maps.locationiq.com/v3/staticmap?key=${process.env.LOCATIONIQ_API_KEY}&center=${locationData.lat},${dataToGroom.data[0].lon}&zoom=13`;
    locationData.show = 'flex';
    locationData.error = false;
    locationData.errorMessage = '';
    locationData.errorCode = '';
    response.status(200).send(locationData);

  } catch (error) {
    locationData.lat = '';
    locationData.lon = '';
    locationData.display_name = '';
    locationData.mapUrl = '';
    locationData.show = 'none';
    locationData.error = true;
    locationData.errorMessage = error.message;
    locationData.errorCode = error.response.status;
    response.status(error.response.status).send(locationData);
  }
});

app.get('/weather', async (request, response, next) => {
  // http://localhost:3001/weather?lat=47.6038321&lon=-122.330062
  try {
    let lat = request.query.lat;
    let lon = request.query.lon;

    let url = `http://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&units=I&lat=${lat}&lon=${lon}`;

    let dataToGroom = await axios.get(url);
    dataToGroom = dataToGroom.data.data;

    weatherData.forecast = dataToGroom.map((element) => {
      return new Forecast(element);
    });
    weatherData.show = 'block';
    weatherData.error = false;
    weatherData.errorMessage = '';
    weatherData.errorCode = '';
    response.status(200).send(weatherData);

  } catch (error) {
    weatherData.forecast = [];
    weatherData.show = 'none';
    weatherData.error = true;
    weatherData.errorMessage = error.message;
    weatherData.errorCode = error.response.status;
    response.status(error.response.status).send(weatherData);
  }
});

app.get('/movies', async (request, response, next) => {
  // http://localhost:3001/movies?city=Seattle
  try {
    let city = request.query.city;

    let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&page=1&include_adult=false&query=${city}`;

    let dataToGroom = await axios.get(url);
    dataToGroom = dataToGroom.data.results;

    movieData.movies = dataToGroom.map((element) => {
      return new Movie(element);
    });

    movieData.movies.forEach((element)=>{
      if(element.image_url=== 'https://image.tmdb.org/t/p/w500null') {
        element.image_url = 'https://via.placeholder.com/500';
      }
    });

    movieData.show = 'block';
    movieData.error = false;
    movieData.errorMessage = '';
    movieData.errorCode = '';
    response.status(200).send(movieData);

  } catch (error) {
    movieData.movies = [];
    movieData.show = 'none';
    movieData.error = true;
    movieData.errorMessage = error.message;
    movieData.errorCode = error.response.status;
    response.status(error.response.status).send(movieData);
  }
});


// ********* Class objects
let Forecast = class {
  constructor(dataObj) {
    this.date = dataObj.valid_date;
    this.description = dataObj.weather.description;
  }
};

let Movie = class {
  constructor(dataObj) {
    this.title = dataObj.title;
    this.overview = dataObj.overview;
    this.average_votes = dataObj.vote_average;
    this.total_votes = dataObj.vote_count;
    this.image_url = 'https://image.tmdb.org/t/p/w500' + dataObj.poster_path;
    this.popularity = dataObj.popularity;
    this.released_on = dataObj.release_date;
  }
};

// **** CATCH-ALL ENDPOINT - must be last
app.get('*', (request, response) => {
  response.status(404).send('This page does not exist');
});

// **** ERROR HANDLING
app.use((error, request, response, next) => {
  response.status(500).send(error.message);
});

// *** Start server
// to kill port, run npx kill-port 3001

app.listen(PORT, () => console.log(`Running on port: ${PORT}`));
