require('mocha');
const sinon = require('sinon');
const expect = require('expect');
const { Types } = require('mongoose');

const { User } = require('../models/user');
const { auth } = require('../middleware/auth');

describe('auth middleware', () => {
  it('should populate req.user with the payload of a valid JWT', async () => {
    const user = { _id: new Types.ObjectId().toHexString() };

    const token = new User(user).genAuthToken();
    const req = {
      header: sinon.mock().returns(token)
    };
    const res = {};
    const next = sinon.mock();

    auth(req, res, next);

    expect(req.user).toMatchObject(user);
  });
});
