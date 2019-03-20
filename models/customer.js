const Joi = require('joi');
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  isGold: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
    trim: true,
    required: true
  },
  phone: {
    type: String,
    minlength: 5,
    maxlength: 50,
    trim: true,
    required: true
  }
});

const Customer = mongoose.model('customer', customerSchema);

function validateCustomer(customer) {
  const schema = {
    isGold: Joi.boolean().default(false),
    name: Joi.string()
      .min(5)
      .max(50)
      .trim()
      .required(),
    phone: Joi.string()
      .min(5)
      .max(50)
      .trim()
      .required()
  };

  return Joi.validate(customer, schema);
}

module.exports = {
  Customer,
  validateCustomer
};
