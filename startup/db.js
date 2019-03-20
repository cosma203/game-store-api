const mongoose = require('mongoose');
const config = require('config');
const { info } = require('winston');

const db = config.get('db');
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
};

module.exports = function() {
  mongoose.connect(db, options, err => {
    if (err) return info(err.message);
    info(`Connected to ${db}.`);
  });
};
