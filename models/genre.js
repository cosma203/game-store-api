const config = require('config');
const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');

const validGenres = config.get('validGenres');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: validGenres,
    trim: true,
    required: true
  }
});

const Genre = mongoose.model('genre', genreSchema);

function validateGenre(genre) {
  const schema = {
    name: Joi.string()
      .only(validGenres)
      .trim()
      .required()
  };

  return Joi.validate(genre, schema);
}

module.exports = {
  Genre,
  genreSchema,
  validateGenre
};
