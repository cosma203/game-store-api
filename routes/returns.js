const Joi = require('joi');
const express = require('express');

const { Rental } = require('../models/rental');
const { Game } = require('../models/game');
const { auth } = require('../middleware/auth');
const { joiValidate } = require('../middleware/joiValidate');

const router = express.Router();

// post route
router.post('/', [auth, joiValidate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.gameId);

  if (!rental) return res.status(404).send('Rental not found.');

  if (rental.dateReturned)
    return res.status(400).send('Return already processed.');

  rental.return();
  await rental.save();

  await Game.updateOne(
    { _id: rental.game._id },
    { $inc: { numberInStock: 1 } }
  );

  res.send(rental);
});

//
function validateReturn(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    gameId: Joi.objectId().required()
  };

  return Joi.validate(req, schema);
}

module.exports = {
  returnsRouter: router
};
