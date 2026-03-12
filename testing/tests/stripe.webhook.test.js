const request = require("supertest");
const mongoose = require("../../server/node_modules/mongoose");

process.env.NODE_ENV = "test";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_dummy";

const mockConstructEvent = jest.fn();

jest.mock(
  "stripe",
  () => {
    return jest.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: jest.fn()
        }
      },
      webhooks: {
        constructEvent: mockConstructEvent
      }
    }));
  },
  { virtual: true }
);

const { app } = require("../../server/server");
const { connectTestDb, clearTestDb, disconnectTestDb } = require("./testDb");
const User = require("../../server/models/UserModel");

describe("Stripe webhook integration", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
    mockConstructEvent.mockReset();
  });

  test("enrolls a user when checkout.session.completed is received", async () => {
    const user = await User.create({
    firstName: "Test",
    lastName: "User",
    username: "testuser1",
    email: "test@example.com",
    password: "password123",
    enrolledCourses: []
  });

    const courseId = new mongoose.Types.ObjectId();

    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          metadata: {
            courseId: courseId.toString(),
            userId: user._id.toString()
          }
        }
      }
    });

    const rawBody = Buffer.from(JSON.stringify({ test: true }));

    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "t=123,v1=fake")
      .set("Content-Type", "application/json")
      .send(rawBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const updatedUser = await User.findById(user._id).lean();
    expect(updatedUser.enrolledCourses.map(String)).toContain(courseId.toString());
  });

  test("returns 400 if Stripe signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const rawBody = Buffer.from(JSON.stringify({ test: true }));

    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "t=123,v1=bad")
      .set("Content-Type", "application/json")
      .send(rawBody);

    expect(res.status).toBe(400);
    expect(res.text).toContain("Webhook Error: Invalid signature");
  });
});