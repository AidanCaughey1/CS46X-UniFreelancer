const request = require("supertest");
const { app } = require("../../server/server"); 
const { connectTestDb, clearTestDb, disconnectTestDb } = require("./testDb");
 
const Seminar = require("../../server/models/SeminarModel");

beforeAll(connectTestDb);
afterAll(disconnectTestDb);
beforeEach(clearTestDb);

describe("GET /api/academy/seminars", () => {
  test("returns empty array when no seminars exist", async () => {
    const res = await request(app).get("/api/academy/seminars");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test("returns all seminars stored in MongoDB", async () => {
    await Seminar.create([
      {
        title: "Seminar A",
        description: "Desc A",
        duration: "45",
        thumbnail: "",
        speaker: { name: "Alice", bio: "", avatar: "" },
        schedule: {
          date: "2026-02-27",
          time: "10:00",
          startAt: new Date("2026-02-27T10:00:00Z"),
          endAt: new Date("2026-02-27T11:00:00Z"),
          sourceTimezone: "UTC",
          zoomMeetingId: "123456789",
          zoomPassword: "abc"
        }
      },
      {
        title: "Seminar B",
        description: "Desc B",
        duration: "",
        thumbnail: "",
        speaker: { name: "Bob", bio: "", avatar: "" },
        schedule: {
          date: "2026-02-28",
          time: "12:00",
          startAt: new Date("2026-02-28T12:00:00Z"),
          endAt: new Date("2026-02-28T13:00:00Z"),
          sourceTimezone: "UTC",
          zoomMeetingId: "987654321",
          zoomPassword: "def"
        }
      }
    ]);

    const res = await request(app).get("/api/academy/seminars");

    expect(res.status).toBe(200);

    // If your API returns { seminars: [...] }, switch to res.body.seminars
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);

    const titles = res.body.map((s) => s.title).sort();
    expect(titles).toEqual(["Seminar A", "Seminar B"]);
  });
});