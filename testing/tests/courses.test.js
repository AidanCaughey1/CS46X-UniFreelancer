const request = require("supertest");
const mongoose = require("../../server/node_modules/mongoose");
const { app } = require("../../server/server");

const { connectTestDb, clearTestDb, disconnectTestDb } = require("./testDb");
const Course = require("../../server/models/CourseModel");

describe("Courses API Happy Path", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  test(
    "should return a list of courses",
    async () => {
      await Course.create({
        title: "Course 1",
        description: "Intro course description",
        instructor: {
          _id: new mongoose.Types.ObjectId(), // REQUIRED by your schema
          name: "Test Instructor"
          // title/bio/avatar/email are optional (defaults)
        }
        // everything else can default
      });

      const res = await request(app).get("/api/academy/courses");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const course = res.body[0];
      expect(course).toHaveProperty("_id");
      expect(course).toHaveProperty("title", "Course 1");
      expect(course).toHaveProperty("description");
      expect(course).toHaveProperty("instructor");
      expect(course.instructor).toHaveProperty("name", "Test Instructor");
      expect(course.instructor).toHaveProperty("_id");
    },
    15000
  );
});