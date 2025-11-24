const request = require("supertest");
const { app, server } = require("../../backend/server");
const assert = require("assert");

// IMPORTANT — require mongoose from backend folder
const mongoose = require("../../backend/node_modules/mongoose");

describe("Courses API Happy Path", function () {
  this.timeout(5000);

  after(async () => {
    // Close HTTP server
    if (server && server.close) {
      await server.close();
    }

    // Close MongoDB connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it("should return a list of courses", async function () {
    const res = await request(app).get("/api/academy/courses").expect(200);

    assert(Array.isArray(res.body), "Response should be an array");

    if (res.body.length > 0) {
      const course = res.body[0];
      assert(course._id);
      assert(course.title);
      assert(course.description);
    }
  });
});
