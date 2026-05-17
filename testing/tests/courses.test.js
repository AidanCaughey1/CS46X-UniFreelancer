process.env.NODE_ENV = "test";
process.env.PORT = "0";

const assert = require("assert");
const request = require("supertest");
const { app, server } = require("../../backend/server");

// Require mongoose from the backend install so the server and tests share the same instance.
const mongoose = require("../../backend/node_modules/mongoose");

describe("Courses API Happy Path", function () {
  this.timeout(5000);

  after(async () => {
    if (server && server.close) {
      await server.close();
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it("should return a list of courses", async function () {
    const response = await request(app).get("/api/academy/courses").expect(200);

    assert(Array.isArray(response.body), "Response should be an array");

    if (response.body.length > 0) {
      const course = response.body[0];
      assert(course._id);
      assert(course.title);
      assert(course.description);
    }
  });
});
