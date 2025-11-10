// testing/tests/courses.test.js
const request = require('supertest');
const app = require('../../backend/server'); // now exports app
const assert = require('assert');

describe('Courses API Happy Path', function () {
  this.timeout(5000);
  it('should return a list of courses', async function () {
    const res = await request(app)
      .get('/api/academy/courses')
      .expect(200);

    assert(Array.isArray(res.body), 'Response should be an array');
    // It's fine if empty initially
    if (res.body.length > 0) {
      const course = res.body[0];
      assert(course._id, 'Course should have an id');
      assert(course.title, 'Course should have a title or name');
      assert(course.description, 'Courses should have a description');
    }
  });
});
