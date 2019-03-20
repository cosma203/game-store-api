const _ = require('lodash');
const bcrypt = require('bcryptjs');
const express = require('express');

const { User, validateUser, validateEmail } = require('../models/user');
const { auth } = require('../middleware/auth');
const { joiValidate } = require('../middleware/joiValidate');

const router = express.Router();

// register a new user
router.post('/register', joiValidate(validateUser), async (req, res) => {
  let user = await User.findOne(_.pick(req.body, 'email'));
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.genAuthToken();

  res.header('x-auth-token', token).send(_.pick(user, ['name', 'email']));
});

// login a user
router.post('/login', joiValidate(validateEmail), async (req, res) => {
  const user = await User.findOne(_.pick(req.body, 'email'));
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password');

  const token = user.genAuthToken();

  res.send(token);
});

// get current user
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  res.send(_.pick(user, ['name', 'email']));
});

module.exports = {
  usersRouter: router
};
