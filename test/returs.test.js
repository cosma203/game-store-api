require('mocha');
const moment = require('moment');
const expect = require('expect');
const request = require('supertest');
const { Types } = require('mongoose');

const { Rental } = require('../models/rental');
const { User } = require('../models/user');
const { Game } = require('../models/game');
const { app } = require('../index');

describe('/api/returns', () => {
  let rental, game, customerId, gameId, token;

  const exec = () => {
    return request(app)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, gameId });
  };

  beforeEach(async () => {
    customerId = new Types.ObjectId();
    gameId = new Types.ObjectId();
    token = new User().genAuthToken();

    game = new Game({
      _id: gameId,
      title: '12345',
      dailyRentalRate: 2,
      genre: { name: 'Action' },
      console: { name: 'Sony Playstation' },
      numberInStock: 10
    });

    rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      game: {
        _id: gameId,
        title: '12345',
        dailyRentalRate: 2
      }
    });

    await game.save();
    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Game.deleteMany({});
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if customerId is not provided', async () => {
    customerId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if gameId is not provided', async () => {
    gameId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental found for this cutomer/game', async () => {
    customerId = new Types.ObjectId();
    gameId = new Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if return is already processed', async () => {
    rental.dateReturned = new Date();

    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if request is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it('should set the returnDate if input is valid', async () => {
    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should set the rentalFee if input is valid', async () => {
    rental.dateOut = moment()
      .add(-7, 'days')
      .toDate();

    await rental.save();

    await exec();

    const rentalInDb = await Rental.findById(rental._id);

    expect(rentalInDb.rentalFee).toBe(14);
  });

  it('should increase the movie stock', async () => {
    await exec();

    const gameInDb = await Game.findById(gameId);

    expect(gameInDb.numberInStock).toBe(game.numberInStock + 1);
  });

  it('should return the rental if input is valid', async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        'dateOut',
        'dateReturned',
        'rentalFee',
        'customer',
        'game'
      ])
    );
  });
});
