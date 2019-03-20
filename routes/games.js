const _ = require('lodash');
const express = require('express');

const { Game, validateGame, validateGameUpdate } = require('../models/game');
const { Console } = require('../models/console');
const { Genre } = require('../models/genre');
const { validateObjectId } = require('../middleware/objectid');
const { joiValidate } = require('../middleware/joiValidate');

const router = express.Router();

// get all games and post a single game routes
router
  .route('/')
  .get(async (req, res) => {
    const games = await Game.find({}).sort('genre');

    res.send(games);
  })
  .post(joiValidate(validateGame), async (req, res) => {
    const cons = await Console.findById(req.body.consoleId);
    if (!cons)
      return res.status(400).send('Console with the given id does not exist.');

    const genre = await Genre.findById(req.body.genreId);
    if (!genre)
      return res.status(400).send('Genre with the given id does not exist.');

    const game = await Game.create(
      new Game({
        title: req.body.title,
        console: _.pick(cons, 'name'),
        genre: _.pick(genre, 'name'),
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
      })
    );

    res.send(game);
  });

// GET all super nintendo games
router.get('/Super', async (req, res) => {
  const games = await Game.find({ 'console.name': 'Super Nintendo' });

  res.send(games);
});

// GET all sony playstation games
router.get('/Sony', async (req, res) => {
  const games = await Game.find({ 'console.name': 'Sony Playstation' });

  res.send(games);
});

// GET all sega mega drive games
router.get('/Sega', async (req, res) => {
  const games = await Game.find({ 'console.name': 'Sega Mega Drive' });

  res.send(games);
});

// GET all RPG games
router.get('/RPG', async (req, res) => {
  const games = await Game.find({ 'genre.name': 'Role-playing' });

  res.send(games);
});

// delete and update a single game routes
router
  .route('/:id')
  .all(validateObjectId)
  .delete(async (req, res) => {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game)
      return res.status(400).send('Game with the given id does not exist.');

    res.send(game);
  })
  .put(joiValidate(validateGameUpdate), async (req, res) => {
    const title = req.body.title;
    const id = req.params.id;

    if (req.body.consoleId && !req.body.genreId) {
      const cons = await Console.findById(req.body.consoleId);
      if (!cons) {
        return res
          .status(400)
          .send('Console with the given id does not exist.');
      }

      const game = await Game.findByIdAndUpdate(
        id,
        {
          title,
          console: _.pick(cons, 'name')
        },
        { new: true }
      );

      if (!game)
        return res.status(400).send('Game with the given id does not exist.');

      return res.send(game);
    }

    if (req.body.genreId && !req.body.consoleId) {
      const genre = await Genre.findById(req.body.genreId);
      if (!genre) {
        return res.status(400).send('Genre with the given id does not exist.');
      }

      const game = await Game.findByIdAndUpdate(
        id,
        {
          title,
          genre: _.pick(genre, 'name')
        },
        { new: true }
      );

      if (!game)
        return res.status(400).send('Game with the given id does not exist.');

      return res.send(game);
    }

    if (req.body.consoleId && req.body.genreId) {
      const cons = await Console.findById(req.body.consoleId);
      if (!cons) {
        return res
          .status(400)
          .send('Console with the given id does not exist.');
      }

      const genre = await Genre.findById(req.body.genreId);
      if (!genre) {
        return res.status(400).send('Genre with the given id does not exist.');
      }

      const game = await Game.findByIdAndUpdate(
        id,
        {
          title,
          console: _.pick(cons, 'name'),
          genre: _.pick(genre, 'name')
        },
        { new: true }
      );

      if (!game)
        return res.status(400).send('Game with the given id does not exist.');

      return res.send(game);
    }

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      {
        title
      },
      { new: true }
    );

    if (!game)
      return res.status(400).send('Game with the given id does not exist.');

    res.send(game);
  });

module.exports = {
  gamesRouter: router
};
