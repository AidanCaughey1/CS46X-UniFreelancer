const request = require("supertest");
const { app } = require("../../server/server"); 
const { connectTestDb, clearTestDb, disconnectTestDb } = require("./testDb");

const Tutorial = require("../../server/models/TutorialModel");

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearTestDb);

describe("GET /api/academy/tutorials", () => {
  test("returns empty array when no tutorials exist", async () => {
    const res = await request(app).get("/api/academy/tutorials");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test("returns all tutorials stored in MongoDB", async () => {
      await Tutorial.create([
    {
        title: "Tutorial 1",
        description: "Intro",
        thumbnail: "",
        content: "Hello",
        category: "General",
        instructor: { name: "Aidan" } 
    },
    {
        title: "Tutorial 2",
        description: "Advanced",
        thumbnail: "",
        content: "World",
        category: "General",
        instructor: { name: "Baron" }
    }
    ]);

    const res = await request(app).get("/api/academy/tutorials");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);

    const titles = res.body.map((t) => t.title).sort();
    expect(titles).toEqual(["Tutorial 1", "Tutorial 2"]);
  });
});