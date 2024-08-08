const request = require('supertest');
const server = require('../api/server');
const db = require('../data/dbConfig');
const jokes = require('./jokes/jokes-data');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

const foo = { username: 'foo', password: 'bar1' };

describe('[POST] /api/auth/register', () => {
  const endpoint = '/api/auth/register';
  test('responds with 201 CREATED', async () => {
    const res = await request(server).post(endpoint).send(foo);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ username: 'foo' });
  });
  test('responds with correct message if username is taken', async () => {
    const res = await request(server).post(endpoint).send(foo);
    expect(res.status).toBe(422);
    expect(res.body).toBe('username taken');
  });
  test('responds with correct message when username or password missing', async () => {
    const user1 = { username: 'foo', password: '' };
    const user2 = { username: '', password: 'bar1' };
    let res = await request(server).post(endpoint).send(user1);
    expect(res.status).toBe(422);
    expect(res.body).toBe('username and password required');
    res = await request(server).post('/api/auth/register').send(user2);
    expect(res.status).toBe(422);
    expect(res.body).toBe('username and password required');
  });

})

describe('[POST] /api/auth/login', () => {
  const endpoint = '/api/auth/login';
  test('responds with 200 OK and correct message', async () => {
    const res = await request(server).post(endpoint).send(foo);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(`welcome, ${foo.username}`);
  });
  test('responds with a token upon successful login', async () => {
    const res = await request(server).post(endpoint).send(foo);
    expect(res.body.token).toBeTruthy();
  });
  test('responds with correct message if username or password is incorrect', async () => {
    const user = { username: foo, password: '1234' };
    const res = await request(server).post(endpoint).send(user);
    expect(res.body).toBe('invalid credentials');
  });
  test('responds with correct message when username or password missing', async () => {
    const user1 = { username: 'foo', password: '' };
    const user2 = { username: '', password: 'bar1' };
    let res = await request(server).post(endpoint).send(user1);
    expect(res.status).toBe(422);
    expect(res.body).toBe('username and password required');
    res = await request(server).post(endpoint).send(user2);
    expect(res.status).toBe(422);
    expect(res.body).toBe('username and password required');
  });
})

describe('[GET] /api/jokes', () => {
  const endpoint = '/api/jokes';
  test('responds with correct message if no token is provided', async () => {
    const res = await request(server).get(endpoint);
    expect(res.body).toBe('token required');
  });
  test('responds with correct message if token is invalid', async () => {
    const res = await request(server).get(endpoint).set({ Authorization: 'foo' });
    expect(res.body).toBe('token invalid');
  });
  test('responds with 200 OK and jokes with proper authorization', async () => {
    const login = await request(server).post('/api/auth/login').send(foo);
    const { token } = login.body;
    const res = await request(server).get(endpoint).set({ Authorization: token });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(jokes);
  })
})