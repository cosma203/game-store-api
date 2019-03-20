const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: true,
    required: true
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: true,
    required: true
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: true,
    required: true
  }
});

userSchema.methods.genAuthToken = function() {
  const user = this;

  const token = jwt.sign({ _id: user._id }, config.get('jwtPrivateKey'));

  return token;
};

const User = mongoose.model('user', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(255)
      .trim()
      .required(),
    email: Joi.string()
      .email()
      .min(5)
      .max(255)
      .trim()
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .trim()
      .required()
  };

  return Joi.validate(user, schema);
}

function validateEmail(user) {
  const schema = {
    email: Joi.string()
      .email()
      .min(5)
      .max(255)
      .trim()
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      .trim()
      .required()
  };

  return Joi.validate(user, schema);
}

module.exports = {
  User,
  validateUser,
  validateEmail
};
