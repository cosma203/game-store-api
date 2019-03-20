require('mocha');
const expect = require('expect');
const request = require('supertest');
const { Types } = require('mongoose');

const { app } = require('../index');
const { Genre } = require('../models/genre');
const { User } = require('../models/user');

let id;

const objId1 = new Types.ObjectId();
const objId2 = new Types.ObjectId();
const objId3 = new Types.ObjectId();

beforeEach(async () => {
  await Genre.insertMany([
    { _id: objId1, name: 'Action' },
    { _id: objId2, name: 'Role-playing' }
  ]);
});

afterEach(async () => {
  await Genre.deleteMany({});
});

describe('GET /api/genres', () => {
  it('should return all genres', async () => {
    const res = await request(app).get('/api/genres');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe('Action');
    expect(res.body[1].name).toBe('Role-playing');
  });
});

describe('GET /api/genres/:id', () => {
  const exec = () => {
    return request(app).get(`/api/genres/${id}`);
  };

  it('should return 404 if OBject Id is not valid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if genre with the given id does not exist', async () => {
    id = objId3.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return a single genre', async () => {
    id = objId1.toHexString();

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Action');
  });
});

describe('DELETE /api/genres/:id', () => {
  const exec = () => {
    return request(app).delete(`/api/genres/${id}`);
  };

  it('should return 404 if OBject Id is not valid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if genre with the given id does not exist', async () => {
    id = objId3.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should delete a single genre', async () => {
    id = objId1.toHexString();

    const res = await exec();

    const genre = await Genre.findById(id);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Action');
    expect(genre).toBeFalsy();
  });
});

describe('PUT /api/genres/:id', () => {
  let newName;

  const exec = () => {
    return request(app)
      .put(`/api/genres/${id}`)
      .send({ name: newName });
  };

  it('should return 404 if Object Id is not valid', async () => {
    id = '123';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if genre with the given id does not exist', async () => {
    id = objId3.toHexString();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if name is invalid', async () => {
    id = objId1.toHexString();
    newName = 'Some invalid name';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should update a single genre', async () => {
    id = objId1.toHexString();
    newName = 'Strategy';

    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(newName);
  });
});

describe('POST /api/genres', () => {
  let token;
  let name;

  const exec = () => {
    return request(app)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name });
  };

  beforeEach(() => {
    token = new User().genAuthToken();
    name = 'Strategy';
  });

  it('should return 401 if user is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if name is invalid', async () => {
    name = 'Some invalid name';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if genre with the same name already exists', async () => {
    name = 'Action';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should create and save a new genre if name is valid', async () => {
    const res = await exec();
    const genre = await Genre.findOne({ name: 'Strategy' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Strategy');
    expect(genre).toBeTruthy();
    expect(genre.name).toBe('Strategy');
  });
});
