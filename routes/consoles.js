const _ = require('lodash');
const express = require('express');

const { Console, validateConsole } = require('../models/console');
const { validateObjectId } = require('../middleware/objectid');
const { joiValidate } = require('../middleware/joiValidate');

const router = express.Router();

// get all consoles and post a single console
router
  .route('/')
  .get(async (req, res) => {
    const consoles = await Console.find({});

    res.send(consoles);
  })
  .post(joiValidate(validateConsole), async (req, res) => {
    const oldCons = await Console.findOne({ name: _.startCase(req.body.name) });
    if (oldCons) return res.status(400).send('Console already exists.');

    const cons = await Console.create(new Console(req.body));

    res.send(cons);
  });

// get a single console,delete a single console and update a single console
router
  .route('/:id')
  .all(validateObjectId)
  .get(async (req, res) => {
    const cons = await Console.findById(req.params.id);
    if (!cons)
      return res.status(400).send('Console with the given id does not exist.');

    res.send(cons);
  })
  .delete(async (req, res) => {
    const cons = await Console.findByIdAndDelete(req.params.id);
    if (!cons)
      return res.status(400).send('Console with the given id does not exist.');

    res.send(cons);
  })
  .put(joiValidate(validateConsole), async (req, res) => {
    const cons = await Console.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name
      },
      { new: true }
    );

    if (!cons)
      return res.status(400).send('Console with the given id does not exist.');

    res.send(cons);
  });

module.exports = {
  consolesRouter: router
};
