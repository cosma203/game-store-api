require('mocha');
const expect = require('expect');
const request = require('supertest');

const { User } = require('../models/user');
const { Genre } = require('../models/genre');
const { app } = require('../index');

describe('auth middleware', () => {
  afterEach(async () => {
    await Genre.deleteMany({});
  });

  let token;

  const exec = () => {
    return request(app)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'Role-playing' });
  };

  beforeEach(() => {
    token = new User().genAuthToken();
  });

  it('should return 401 if no token is provided', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'a';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid', async () => {
    await Genre.deleteMany({});

    const res = await exec();

    expect(res.status).toBe(200);
  });
});
