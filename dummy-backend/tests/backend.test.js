const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../server');

const DATA_DIR = path.join(__dirname, '../data');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');

// Reset data before each test
beforeEach(() => {
  fs.writeFileSync(COURSES_FILE, JSON.stringify([], null, 2));
});

// Test GET all courses
test('GET /api/academy/courses should return an array', async () => {
  const res = await request(app).get('/api/academy/courses');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

// Test POST create a new course
test('POST /api/academy/courses should create a new course', async () => {
  const newCourse = { title: 'Test Course', category: 'Testing', duration: '4 weeks' };
  const res = await request(app)
    .post('/api/academy/courses')
    .send(newCourse);

  expect(res.status).toBe(201);
  expect(res.body.title).toBe('Test Course');
});

// Test GET course by valid ID
test('GET /api/academy/courses/:id should return a specific course', async () => {
  const course = { title: 'Find Me', category: 'Search' };
  const postRes = await request(app).post('/api/academy/courses').send(course);
  const id = postRes.body.id;

  const getRes = await request(app).get(`/api/academy/courses/${id}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body.title).toBe('Find Me');
});

// Test GET course by invalid ID
test('GET /api/academy/courses/:id should return 404 for invalid ID', async () => {
  const res = await request(app).get('/api/academy/courses/invalid-id');
  expect(res.status).toBe(404);
  expect(res.body.error).toMatch(/not found/i);
});

// Test PUT update an existing course
test('PUT /api/academy/courses/:id should update a course', async () => {
  const course = { title: 'Old Title', category: 'Dev' };
  const postRes = await request(app).post('/api/academy/courses').send(course);
  const id = postRes.body.id;

  const updateRes = await request(app)
    .put(`/api/academy/courses/${id}`)
    .send({ title: 'New Title' });

  expect(updateRes.status).toBe(200);
  expect(updateRes.body.title).toBe('New Title');
});

// Test PUT invalid ID
test('PUT /api/academy/courses/:id should return 404 for invalid ID', async () => {
  const res = await request(app)
    .put('/api/academy/courses/unknown')
    .send({ title: 'Does Not Exist' });

  expect(res.status).toBe(404);
  expect(res.body.error).toMatch(/not found/i);
});

// Test DELETE existing course
test('DELETE /api/academy/courses/:id should delete a course', async () => {
  const course = { title: 'Delete Me', category: 'QA' };
  const postRes = await request(app).post('/api/academy/courses').send(course);
  const id = postRes.body.id;

  const delRes = await request(app).delete(`/api/academy/courses/${id}`);
  expect(delRes.status).toBe(200);
  expect(delRes.body.message).toMatch(/deleted successfully/i);
});

// Test DELETE invalid ID
test('DELETE /api/academy/courses/:id should return 404 if not found', async () => {
  const res = await request(app).delete('/api/academy/courses/fake-id');
  expect(res.status).toBe(404);
  expect(res.body.error).toMatch(/not found/i);
});

// Test health check route
test('GET /api/health should return system status', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toMatch(/running/i);
});

// Test root route
test('GET / should return API info', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body.message).toMatch(/UniFreelancer/);
});
