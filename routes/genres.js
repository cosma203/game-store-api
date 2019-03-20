const _ = require('lodash');
const express = require('express');

const { Genre, validateGenre } = require('../models/genre');
const { validateObjectId } = require('../middleware/objectid');
const { auth } = require('../middleware/auth');
const { joiValidate } = require('../middleware/joiValidate');

const router = express.Router();

// get all genres and post a single genre routes
router
  .route('/')
  .get(async (req, res) => {
    const genres = await Genre.find({});

    res.send(genres);
  })
  .post(joiValidate(validateGenre), auth, async (req, res) => {
    const oldGenre = await Genre.findOne(_.pick(req.body, ['name']));
    if (oldGenre) return res.status(400).send('Genre already exists.');

    const genre = await Genre.create(_.pick(req.body, ['name']));

    res.send(genre);
  });

// get a single genre,delete a singe genre and update a single genre
router
  .route('/:id')
  .all(validateObjectId)
  .get(async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre)
      return res.status(400).send('Genre with the given id not found!');

    res.send(genre);
  })
  .delete(async (req, res) => {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre)
      return res.status(400).send('Genre with the given id not found!');

    res.send(genre);
  })
  .put(joiValidate(validateGenre), async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, ['name']),
      { new: true }
    );

    if (!genre)
      return res.status(400).send('Genre with the given id not found!');

    res.send(genre);
  });

module.exports = {
  genresRouter: router
};
