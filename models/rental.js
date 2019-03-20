const Joi = require('joi');
const moment = require('moment');
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        minlength: 5,
        maxlength: 50,
        trim: true,
        required: true
      },
      isGold: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String,
        minlength: 5,
        maxlength: 50,
        trim: true,
        required: true
      }
    }),
    required: true
  },
  game: {
    type: new mongoose.Schema({
      title: {
        type: String,
        minlength: 5,
        maxlength: 250,
        trim: true,
        required: true
      },
      dailyRentalRate: {
        type: Number,
        min: 0,
        max: 255,
        required: true
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    default: Date.now()
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

rentalSchema.statics.lookup = function(customerId, gameId) {
  return this.findOne({
    'customer._id': customerId,
    'game._id': gameId
  });
};

rentalSchema.methods.return = function() {
  const rental = this;

  rental.dateReturned = new Date();

  const rentalDays = moment().diff(rental.dateOut, 'days');
  rental.rentalFee = rentalDays * rental.game.dailyRentalRate;
};

const Rental = mongoose.model('rental', rentalSchema);

function validateRental(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    gameId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

module.exports = {
  Rental,
  validateRental
};
