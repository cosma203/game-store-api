const { Types } = require('mongoose');

function validateObjectId(req, res, next) {
  const valid = Types.ObjectId.isValid(req.params.id);
  if (!valid) return res.status(404).send('Invalid Object ID.');

  next();
}

module.exports = {
  validateObjectId
};
