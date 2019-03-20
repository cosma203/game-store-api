require('mocha');
const expect = require('expect');
const request = require('supertest');
const { Types } = require('mongoose');

const { app } = require('../index');
const { Genre } = require('../models/genre');
const { Console } = require('../models/console');
const { Game } = require('../models/game');

afterEach(async () => {
  await Game.deleteMany({});
});

describe('GET /api/games', () => {
  beforeEach(async () => {
    await Game.insertMany([
      { title: 'Super Mario World', numberInStock: 1, dailyRentalRate: 20 },
      { title: 'Kirby', numberInStock: 1, dailyRentalRate: 20 }
    ]);
  });

  it('should get all games', async () => {
    const res = await request(app).get('/api/games');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('Super Mario World');
    expect(res.body[1].title).toBe('Kirby');
  });
});

describe('GET /api/games/someConsole', () => {
  let consoleName;

  const exec = () => {
    return request(app).get(`/api/games/${consoleName}`);
  };

  beforeEach(async () => {
    await Game.insertMany([
      {
        title: 'Super Mario World',
        console: { name: 'Super Nintendo' },
        numberInStock: 1,
        dailyRentalRate: 20
      },
      {
        title: 'Donkey Kong Country',
        console: { name: 'Super Nintendo' },
        numberInStock: 1,
        dailyRentalRate: 20
      },
      {
        title: 'Final Fantasy',
        console: { name: 'Sony Playstation' },
        numberInStock: 1,
        dailyRentalRate: 20
      },
      {
        title: 'Crash Bandicoot',
        console: { name: 'Sony Playstation' },
        numberInStock: 1,
        dailyRentalRate: 20
      },
      {
        title: 'Super Sonic',
        console: { name: 'Sega Mega Drive' },
        numberInStock: 1,
        dailyRentalRate: 20
      },
      {
        title: 'ToeJam and Earl',
        console: { name: 'Sega Mega Drive' },
        numberInStock: 1,
        dailyRentalRate: 20
      }
    ]);
  });

  it('should return all Super Nintendo games', async () => {
    consoleName = 'Super';

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    res.body.forEach(e => {
      expect(e.console.name).toBe('Super Nintendo');
    });
  });

  it('should return all Sony Playstation games', async () => {
    consoleName = 'Sony';

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    res.body.forEach(e => {
      expect(e.console.name).toBe('Sony Playstation');
    });
  });

  it('should return all Sega Mega Drive games', async () => {
    consoleName = 'Sega';

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    res.body.forEach(e => {
      expect(e.console.name).toBe('Sega Mega Drive');
    });
  });
});

describe('POST /api/games', () => {
  let consoleId;
  let genreId;

  const title = 'Super Mario World';
  const objId1 = new Types.ObjectId();
  const objId2 = new Types.ObjectId();

  const exec = () => {
    return request(app)
      .post('/api/games')
      .send({
        title,
        consoleId,
        genreId,
        numberInStock: 1,
        dailyRentalRate: 20
      });
  };

  beforeEach(async () => {
    await Console.create({ _id: objId1, name: 'Super Nintendo' });
    await Genre.create({ _id: objId2, name: 'Action' });
  });

  afterEach(async () => {
    await Console.deleteMany({});
    await Genre.deleteMany({});
    await Game.deleteMany({});
  });

  it('should return 400 if genreId is not provided', async () => {
    const cons = Console.findById(objId1);

    consoleId = cons._id;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if genreId is not a valid ObjectId', async () => {
    const cons = Console.findById(objId1);

    consoleId = cons._id;
    genreId = '123';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if genre with the given id does not exist', async () => {
    const cons = Console.findById(objId1);

    consoleId = cons._id;
    genreId = objId1;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if consoleId is not provided', async () => {
    const genre = await Genre.findById(objId2);

    genreId = genre._id;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if consoleId is not a valid ObjectId', async () => {
    const genre = await Genre.findById(objId2);

    genreId = genre._id;
    consoleId = '123';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if console with the given id does not exist', async () => {
    const genre = await Genre.findById(objId2);

    genreId = genre._id;
    consoleId = objId2;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should create a new game', async () => {
    const cons = await Console.findById(objId1);
    const genre = await Genre.findById(objId2);

    consoleId = cons._id;
    genreId = genre._id;

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.console.name).toBe('Super Nintendo');
    expect(res.body.genre.name).toBe('Action');
  });
});

describe('DELETE /api/games/:id', () => {
  let id;

  const objId1 = new Types.ObjectId();
  const objId2 = new Types.ObjectId();
  const objId3 = new Types.ObjectId();

  const exec = () => {
    return request(app).delete(`/api/games/${id}`);
  };

  beforeEach(async () => {
    await Game.insertMany([
      {
        _id: objId1,
        title: 'Donkey Kong Country',
        numberInStock: 1,
        dailyRentalRate: 20
      },
      {
        _id: objId2,
        title: 'Super Mario World',
        numberInStock: 1,
        dailyRentalRate: 20
      }
    ]);
  });

  it('should return 404 if Object Id is not valid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if game with the given id does not exist', async () => {
    id = objId3.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should delete a single game', async () => {
    id = objId2.toHexString();

    const res = await exec();
    const game = await Game.findById(id);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Super Mario World');
    expect(game).toBeFalsy();
  });
});

describe('PUT /api/games/:id', () => {
  let id;
  let title;
  let consoleId;
  let genreId;

  const gameObjId = new Types.ObjectId();
  const consoleObjId = new Types.ObjectId();
  const consoleObjId1 = new Types.ObjectId();
  const genreObjId = new Types.ObjectId();
  const genreObjId1 = new Types.ObjectId();
  const unknownObjId = new Types.ObjectId();

  const exec = () => {
    return request(app)
      .put(`/api/games/${id}`)
      .send({
        title,
        consoleId,
        genreId,
        numberInStock: 1,
        dailyRentalRate: 20
      });
  };

  beforeEach(async () => {
    await Console.insertMany([
      {
        _id: consoleObjId.toHexString(),
        name: 'Sony Playstation'
      },
      {
        _id: consoleObjId1.toHexString(),
        name: 'Super Nintendo'
      }
    ]);
    await Genre.insertMany([
      { _id: genreObjId.toHexString(), name: 'Action' },
      { _id: genreObjId1.toHexString(), name: 'Role-playing' }
    ]);
    await Game.create({
      _id: gameObjId.toHexString(),
      title: 'Crash Bandicoot',
      consoleId: consoleObjId.toHexString(),
      genreId: genreObjId.toHexString(),
      numberInStock: 1,
      dailyRentalRate: 20
    });
  });

  it('should return 404 if objectId is invalid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if title does not exist', async () => {
    id = gameObjId.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if game with the given id does not exist', async () => {
    id = unknownObjId.toHexString();
    title = 'Crash Bandicoot';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if console with the given id does not exist', async () => {
    id = gameObjId.toHexString();
    consoleId = unknownObjId.toHexString();
    title = 'Crash Bandicoot';

    const res = await exec();
    const cons = await Console.findById(consoleId);

    expect(res.status).toBe(400);
    expect(cons).toBeFalsy();
  });

  it('should return 400 if genre with the given id does not exist', async () => {
    id = gameObjId.toHexString();
    genreId = unknownObjId.toHexString();
    title = 'Crash Bandicoot';

    const res = await exec();
    const genre = await Genre.findById(genreId);

    expect(res.status).toBe(400);
    expect(genre).toBeFalsy();
  });

  it('should update the title of the game', async () => {
    id = gameObjId.toHexString();
    consoleId = consoleObjId1.toHexString();
    genreId = genreObjId1.toHexString();
    title = 'Teken';

    const res = await exec();
    const game = await Game.findById(id);
    const cons = await Console.findById(consoleId);
    const genre = await Genre.findById(genreId);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(title);
    expect(res.body.console.name).toBe(cons.name);
    expect(res.body.genre.name).toBe(genre.name);
    expect(game.title).toBe(title);
    expect(game.console.name).toBe(cons.name);
    expect(game.genre.name).toBe(genre.name);
  });
});
