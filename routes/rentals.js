const Fawn = require('fawn');
const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

const { Rental, validateRental } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Game } = require('../models/game');
const { auth } = require('../middleware/auth');
const { joiValidate } = require('../middleware/joiValidate');

const router = express.Router();

Fawn.init(mongoose);

// get all and create a single rental
router
  .route('/')
  .get(async (req, res) => {
    const rentals = await Rental.find({}).sort('-dateOut');

    res.send(rentals);
  })
  .post(joiValidate(validateRental), auth, async (req, res) => {
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer');

    const game = await Game.findById(req.body.gameId);
    if (!game) return res.status(400).send('Invalid game');

    if (game.numberInStock === 0)
      return res.status(400).send('Game not in stock.');

    const rental = new Rental({
      customer: _.pick(customer, ['_id', 'name', 'phone']),
      game: _.pick(game, ['_id', 'title', 'dailyRentalRate'])
    });

    try {
      new Fawn.Task()
        .save('rentals', rental)
        .update('games', { _id: game._id }, { $inc: { numberInStock: -1 } })
        .run();
    } catch (ex) {
      res.status(500).send('Something failed.');
    }
  });

module.exports = {
  rentalsRouter: router
};
