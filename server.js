'use strict';
// *** REQUIRES
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const getLocation = require('./modules/location');
const getWeather = require('./modules/weather');
const getMovies = require('./modules/movies');
const getRestaurants = require('./modules/restaurants');

// Start express
const app = express();

// *** MIDDLEWARE
app.use(cors());

// *** DEFINE PORT
const PORT = process.env.PORT || 3002;

// *** ENDPOINTS
app.get('/', (request, response) => {
  response.status(200).send('Welcome to my server');
});

app.get('/location', async (request, response) => {
  getLocation(request,response);
});

app.get('/weather', async (request, response) => {
  getWeather(request, response);
});

app.get('/movies', async (request, response) => {
  getMovies(request,response);
});

app.get('/restaurants', async (request, response) => {
  getRestaurants(request,response);
});

// **** CATCH-ALL ENDPOINT - must be last
app.get('*', (request, response) => {
  response.status(404).send('This page does not exist');
});

// **** ERROR HANDLING
app.use((error, request, response) => {
  response.status(500).send(error.message);
});

app.listen(PORT, () => console.log(`Running on port: ${PORT}`));
