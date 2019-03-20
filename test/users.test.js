require('mocha');
const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { Types } = require('mongoose');

const { app } = require('../index');
const { User } = require('../models/user');

const userOneId = new Types.ObjectId();
const userTwoId = new Types.ObjectId();
const userThreeId = new Types.ObjectId();
const userFourId = new Types.ObjectId();

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/users/register', () => {
  let name;
  let email;
  let password;

  const exec = () => {
    return request(app)
      .post('/api/users/register')
      .send({ name, email, password });
  };

  beforeEach(async () => {
    await User.insertMany([
      {
        _id: userOneId,
        name: 'User1',
        email: 'user1@gmail.com',
        password: '12345'
      },
      {
        _id: userTwoId,
        name: 'User2',
        email: 'user2@gmail.com',
        password: '12345'
      }
    ]);

    name = 'UserThree';
    email = '123@gmail.com';
    password = '12345';
  });

  it('should return 400 if name is not provided', async () => {
    name = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if password is not provided', async () => {
    password = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if email is not provided', async () => {
    email = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    email = '12345';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if user is already registered', async () => {
    email = 'user1@gmail.com';

    const res = await exec();
    const user = User.findOne(email);

    expect(res.status).toBe(400);
    expect(user).toBeTruthy();
  });

  it('should register a new user', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name, email });
  });
});

describe('POST /api/users/login', async () => {
  const salt = await bcrypt.genSalt(10);
  const pass1 = '12345';
  const pass2 = 'abcde';
  const hashedPass1 = await bcrypt.hash(pass1, salt);
  const hashedPass2 = await bcrypt.hash(pass2, salt);

  let email;
  let password;

  const exec = () => {
    return request(app)
      .post('/api/users/login')
      .send({ email, password });
  };

  beforeEach(async () => {
    await User.insertMany([
      {
        _id: userThreeId,
        name: 'User3',
        email: 'user3@gmail.com',
        password: hashedPass1
      },
      {
        _id: userFourId,
        name: 'User4',
        email: 'user4@gmail.com',
        password: hashedPass2
      }
    ]);

    email = 'user3@gmail.com';
    password = '12345';
  });

  it('should return 400 if email is not provided', async () => {
    email = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    email = 'qweqwe@gmail.com';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if password is not provided', async () => {
    password = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if password is invalid', async () => {
    password = '2222222';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should login a user', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('User3');
    expect(res.body.email).toBe('user3@gmail.com');
  });
});
