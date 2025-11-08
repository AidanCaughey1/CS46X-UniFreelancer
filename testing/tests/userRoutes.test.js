// testing/userRoutes.test.js
const request = require('supertest');
const app = require('../src/index');

describe('User Routes', () => {
  
  // Test GET /users
  describe('GET /users', () => {
    it('should return status 200 and an array of users', async () => {
      const res = await request(app).get('/users');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // Test POST /users
  describe('POST /users', () => {
    it('should create a new user and return status 201', async () => {
      const newUser = { 
        name: 'Test User', 
        email: 'testuser@example.com' 
      };
      const res = await request(app)
        .post('/users')
        .send(newUser)
        .set('Accept', 'application/json');
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'testuser@example.com');
      expect(res.body).toHaveProperty('id'); // our mock ID
    });
  });

  // Test GET /users/:id
  describe('GET /users/:id', () => {
    it('should return a single user by id', async () => {
      // First create a user
      const newUser = { name: 'Alice', email: 'alice@example.com' };
      const postRes = await request(app)
        .post('/users')
        .send(newUser)
        .set('Accept', 'application/json');

      const userId = postRes.body.id;

      // Then get that user by ID
      const res = await request(app).get(`/users/${userId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body).toHaveProperty('name', 'Alice');
    });
  });

});
