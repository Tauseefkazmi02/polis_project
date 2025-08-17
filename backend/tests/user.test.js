const request = require('supertest');
const app = require('../index'); // Assuming your express app is exported from index.js
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect('mongodb://localhost:27017/polisproject_test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('User API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
        email: 'testuser@example.com'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should not register a user with existing username', async () => {
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser2',
        password: 'testpassword',
        email: 'testuser2@example.com'
      });
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser2',
        password: 'testpassword',
        email: 'testuser2@example.com'
      });
    expect(res.statusCode).toEqual(409);
  });

  it('should login a user', async () => {
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'loginuser',
        password: 'loginpassword',
        email: 'loginuser@example.com'
      });
    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: 'loginuser',
        password: 'loginpassword'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
  });
});
