const request = require("supertest");
const { app, startServer, stopServer } = require("../../backend/server");
const assert = require("assert");

let server;

describe("Courses API Happy Path", function () {
  this.timeout(5000);

  // Start server & DB before tests
  before(async () => {
    server = await startServer();
  });

  // Stop server & DB after tests
  after(async () => {
    await stopServer(server);
  });

  it("should return a list of courses", async function () {
    const res = await request(app).get("/api/academy/courses").expect(200);

    assert(Array.isArray(res.body), "Response should be an array");
    if (res.body.length > 0) {
      const course = res.body[0];
      assert(course._id, "Course should have an id");
      assert(course.title, "Course should have a title or name");
      assert(course.description, "Courses should have a description");
    }
  });
});
