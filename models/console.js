const config = require('config');
const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');

const validConsoles = config.get('validConsoles');

const consoleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: validConsoles,
    trim: true,
    required: true
  }
});

consoleSchema.pre('validate', function(next) {
  if (this.isModified('name')) {
    this.name = _.startCase(this.name);
  }

  next();
});

const Console = mongoose.model('console', consoleSchema);

function validateConsole(console) {
  const schema = {
    name: Joi.string()
      .only(validConsoles)
      .trim()
      .insensitive()
      .required()
  };

  return Joi.validate(console, schema);
}

module.exports = {
  Console,
  validateConsole,
  consoleSchema
};
