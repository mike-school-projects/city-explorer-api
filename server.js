'use strict';
// *** REQUIRES
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { response } = require('express');
const weatherData = require('./data/weather.json');

// Start express
const app = express();

// *** MIDDLEWARE
app.use(cors());

// *** DEFINE PORT
const PORT = process.env.PORT || 3002;

// *** ENDPOINTS
// ***** Base endpoint - proof of life
// 1st argument: '/' is the endpoint
// 2nd argument: callback function with request and response as parameters
app.get('/', (request, response) => {
  response.status(200).send('Welcome to my server');

});

app.get('/hello', (request, response) => {
  console.log(request.query);

  let firstName = request.query.firstName;
  let lastName = request.query.lastName;
  response.status(200).send(`Hello ${firstName} ${lastName}! Welcome to my server!`);
});


app.get('/weather', (request, response, next) => {
  try {
    let city = request.query.city;
    let lat = request.query.lat;
    let lon = request.query.lon;

    let dataToGroom = weatherData.find(element => element.city_name === city);
    let dataToSend = [];
    for (let i = 0; i < 3; i++) {
      dataToSend[i] = new Forecast(dataToGroom, i);
    }

    console.log(dataToSend);
    response.status(200).send(dataToSend);

  } catch (error) {
    response.status(500).send('could not find city');
    next(error);
  }
});

let Forecast = class {
  constructor(dataObj, i) {
    this.city_name = dataObj.city_name;
    this.date = dataObj.data[i].valid_date;
    this.description = dataObj.data[i].weather.description;
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


// let Forecast = class {
//   constructor(high, low, date, weather) {
//     this.high = high;
//     this.low = low;
//     this.date = date;
//     this.weather = weather;
//     this.description = 'Low of ' + this.low + ', high of ' + this.high + ' with ' + this.weather;
//   }
// };
