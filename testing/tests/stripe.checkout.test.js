const request = require("supertest");
const mongoose = require("../../server/node_modules/mongoose");

process.env.NODE_ENV = "test";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
process.env.FRONTEND_URL = "http://localhost:3000";

jest.mock("../../server/middleware/authMiddleware", () => ({
  protect: (req, _res, next) => {
    req.user = { _id: "507f1f77bcf86cd799439011" };
    next();
  }
}));

const mockCreateSession = jest.fn().mockResolvedValue({
  url: "https://checkout.stripe.com/c/test_session_123"
});

jest.mock(
  "stripe",
  () => {
    return jest.fn().mockImplementation(() => ({
      checkout: {
        sessions: {
          create: mockCreateSession
        }
      },
      webhooks: {
        constructEvent: jest.fn()
      }
    }));
  },
  { virtual: true }
);

const { app } = require("../../server/server");
const { connectTestDb, clearTestDb, disconnectTestDb } = require("./testDb");
const Course = require("../../server/models/CourseModel");

describe("Stripe payments integration", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
    mockCreateSession.mockClear();
  });

  test("creates a Stripe checkout session for a paid course", async () => {
    const course = await Course.create({
      title: "Paid Course",
      description: "A paid course",
      instructor: {
        _id: new mongoose.Types.ObjectId(),
        name: "Test Instructor"
      },
      pricing: {
        amount: 25,
        currency: "USD",
        type: "one-time"
      }
    });

    const res = await request(app)
      .post("/api/payments/create-checkout-session")
      .send({ courseId: course._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "url",
      "https://checkout.stripe.com/c/test_session_123"
    );

    expect(mockCreateSession).toHaveBeenCalledTimes(1);

    const stripeArg = mockCreateSession.mock.calls[0][0];
    expect(stripeArg).toMatchObject({
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        courseId: course._id.toString(),
        userId: "507f1f77bcf86cd799439011"
      }
    });

    expect(stripeArg.line_items[0].price_data.unit_amount).toBe(2500);
    expect(stripeArg.line_items[0].price_data.product_data.name).toBe("Paid Course");
  });

  test("returns 404 if course does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post("/api/payments/create-checkout-session")
      .send({ courseId: fakeId.toString() });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Course not found");
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});