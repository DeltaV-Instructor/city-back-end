'use strict';
console.log('server is connected!!!');

//REQUIRE
const express= require('express');
const axios = require('axios');
require('dotenv').config();
// let weatherData = require('./data/weather.json');
const cors = require('cors');
//================================================//
//USE
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;


app.get('/movies', getMovies);

async function getMovies(request, response){
  try {
    let searchQuery = request.query.searchQuery; //front end should hit the /movies?searchQuery="value"
    console.log('A. front end query: ', searchQuery);
    //https://developers.themoviedb.org/3/search/search-movies
    let url =`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${searchQuery}`;
    //Test URL localhost:3001/movies?searchQuery=Seattle
    let cityMovie = await axios.get(url);
    console.log('B. axios get: ', cityMovie);
    //response.status(200).send(cityMovie.data); run this to look at the json returned in the browser at port 3001
   
    //now dont forget to dig into the movie data with the cityMovie.data.results.map()
    let moviesArray = cityMovie.data.results.map(movieData => new Movie(movieData));
    console.log('C. Movies ARRAY!!',moviesArray);

    response.status(200).send(moviesArray); //switch over to this when we are ready to send to front end.
     // response.send('hi'); //place holder while building out the function and testing in browser on port 3001.
  } catch (error) {
    console.log(error);
  }
}


app.get('/weather', async (request, response, next) => {
  try {
    // console.log('1. City,lat,lon', request.query);
    let lat= request.query.lat;
    let lon= request.query.lon;
    // console.log('2. Lat,Lon to API', lat, lon);
    const url =`http://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHER_API_KEY}&lang=en&units=I&days=5&lat=${lat}&lon=${lon}`;
    // console.log('3. url: ',url);
    let weatherData = await axios.get(url);
    // console.log('4. weatherData before we send it to Constructor', weatherData.data.data);
    let weatherForcast = weatherData.data.data.map(weatherData => new Forecast(weatherData));
    // console.log('5. Forecast Construtor returns: ',weatherForcast);

    // console.log('6. response object (200) ', weatherForcast);
    response.status(200).send(weatherForcast);
    // response.send('hi');
  } catch (error) {
    next(error);
  }
});



app.get('*', (request, response) => {
  response.send('The location was not found. Error 404');
});


class Movie{
  constructor(movieObject) {
    // console.log('7. Date time:', forecastObject.datatime);
    // this.dataTime = forecastObject.datatime;
    /** THIS ERROR TOOK ME 15 MINUTES TO FIND: ITS DATE NOT DATA!!!! */
    this.title = movieObject.title;
    //https://developers.themoviedb.org/3/getting-started/images
    //use ternary to load missing image picture if the api does not have a poster 
    this.src = movieObject.poster_path ? movieObject.poster_path : 'myImage.jpg' ;
    this.overview = movieObject.overview;
  }
}


class Forecast{
  constructor(forecastObject) {
    // console.log('7. Date time:', forecastObject.datatime);
    // this.dataTime = forecastObject.datatime;
    /** THIS ERROR TOOK ME 15 MINUTES TO FIND: ITS DATE NOT DATA!!!! */
    this.datetime = forecastObject.datetime;
    this.description = forecastObject.weather.description;
    this.temp = forecastObject.temp;
    this.min_temp = forecastObject.min_temp;
    this.max_temp = forecastObject.max_temp;
  }
}

//ERRORS
// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) =>{
  response.status(500).send(error.message);
});


//LISTEN
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));
