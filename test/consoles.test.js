require('mocha');
const expect = require('expect');
const request = require('supertest');
const { Types } = require('mongoose');

const { app } = require('../index');
const { Console } = require('../models/console');

let id;

const objId1 = new Types.ObjectId();
const objId2 = new Types.ObjectId();
const objId3 = new Types.ObjectId();

beforeEach(async () => {
  await Console.insertMany([
    { _id: objId1, name: 'Super Nintendo' },
    { _id: objId2, name: 'Sony Playstation' }
  ]);
});

afterEach(async () => {
  await Console.deleteMany({});
});

describe('GET /api/consoles', () => {
  it('should return all consoles', async () => {
    const res = await request(app).get('/api/consoles');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe('Super Nintendo');
    expect(res.body[1].name).toBe('Sony Playstation');
  });
});

describe('GET /api/consoles/:id', () => {
  const exec = () => {
    return request(app).get(`/api/consoles/${id}`);
  };

  it('should return 404 if Object Id is not valid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if console with the given id does not exist', async () => {
    id = objId3.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return a single console', async () => {
    id = objId2.toHexString();

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Sony Playstation');
  });
});

describe('POST /api/consoles', () => {
  let name;

  const exec = () => {
    return request(app)
      .post('/api/consoles')
      .send({ name: name });
  };

  it('should return 400 if console name is invalid', async () => {
    name = 'Some invalid name';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if console with the same name already exists', async () => {
    name = 'Super Nintendo';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should create a new console if name is valid', async () => {
    name = 'Sega Mega Drive';

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Sega Mega Drive');
  });
});

describe('DELETE /api/consoles/:id', () => {
  const exec = () => {
    return request(app).delete(`/api/consoles/${id}`);
  };

  it('should return 404 if Object Id is not valid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if console with the given id does not exist', async () => {
    id = objId3.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should delete a single console', async () => {
    id = objId2.toHexString();

    const res = await exec();

    const cons = await Console.findById(id);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Sony Playstation');
    expect(cons).toBeFalsy();
  });
});

describe('PUT /api/consoles/:id', () => {
  let name;

  const exec = () => {
    return request(app)
      .put(`/api/consoles/${id}`)
      .send({ name });
  };

  it('should return 404 if Object Id is invalid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if console with the given id does not exist', async () => {
    id = objId3.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if name is invalid', async () => {
    name = 'Some invalid name';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should update a single console', async () => {
    id = objId2.toHexString();
    name = 'Sega Mega Drive';

    const res = await exec();

    const cons = await Console.findById(id);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(name);
    expect(cons.name).toBe(name);
  });
});
