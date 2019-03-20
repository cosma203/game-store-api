const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');

const { consoleSchema } = require('./console');
const { genreSchema } = require('./genre');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 5,
    maxlength: 250,
    trim: true,
    required: true
  },
  console: consoleSchema,

  genre: genreSchema,

  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  }
});

gameSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.title = _.startCase(this.title);
  }

  next();
});

const Game = mongoose.model('game', gameSchema);

function validateGame(game) {
  const schema = {
    title: Joi.string()
      .min(5)
      .max(250)
      .trim()
      .required(),
    consoleId: Joi.objectId().required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number()
      .min(0)
      .max(255)
      .required(),
    dailyRentalRate: Joi.number()
      .min(0)
      .max(255)
      .required()
  };

  return Joi.validate(game, schema);
}

function validateGameUpdate(game) {
  const schema = {
    title: Joi.string()
      .min(5)
      .max(250)
      .trim()
      .required(),
    consoleId: Joi.objectId(),
    genreId: Joi.objectId(),
    numberInStock: Joi.number()
      .min(0)
      .max(255)
      .required(),
    dailyRentalRate: Joi.number()
      .min(0)
      .max(255)
      .required()
  };

  return Joi.validate(game, schema);
}

module.exports = {
  Game,
  validateGame,
  validateGameUpdate
};
