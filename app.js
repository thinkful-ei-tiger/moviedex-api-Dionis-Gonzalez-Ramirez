const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const data = require('./data');
require('dotenv').config();

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

app.use(validation);

function validation(req, res, next) {
  const auth = req.get('Authorization')
  const validAuth = process.env.API_TOKEN
  if (auth && auth.split(' ')[1] === validAuth) {
    return next();
  }
  return res.status(400).json({error: 'Unauthorized access!'})
}

function getMovies(req, res) {
  let movies = [...data];
  const lowerQueries = {}
  for (q in req.query) lowerQueries[q.toLowerCase()] = req.query[q];
  let { genre, country, avg_vote } = lowerQueries;

  if (genre) {
    genre = genre.slice(0,1).toUpperCase() + genre.slice(1).toLowerCase();
    movies = movies.filter(movie => movie.genre === genre);
    if (movies.length === 0) return res.status(204).json({error: `No movies with that genre!`})
  }

  if (country) {
    country = country.slice(0,1).toUpperCase() + country.slice(1).toLowerCase();
    movies = movies.filter(movie => movie.country === country);
    if (movies.length === 0) return res.status(204).json({error: `No movies from that country!`})
  }

  if (avg_vote) {
    avg_vote = Number(avg_vote);
    movies = movies.filter(movie => movie['avg_vote'] >= avg_vote);
    if (movies.length === 0) return res.status(204).json({error: `No movies with that average vote count!`})
  }

  if (movies.length === 0) {
    return res.status(204).json({error: `No movie matches!`})
  }

  return res.json(movies);
}

app.listen(8000, () => {
  console.log('Running on port 8000.')
})

app.get('/movie', getMovies)