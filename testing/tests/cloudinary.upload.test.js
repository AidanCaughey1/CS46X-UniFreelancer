const request = require("supertest");
const express = require("express");

// Mock cloudinary BEFORE requiring the upload route
const mockUploadStream = jest.fn();

jest.mock(
  "cloudinary",
  () => ({
    v2: {
      config: jest.fn(),
      uploader: {
        upload_stream: (...args) => mockUploadStream(...args),
        destroy: jest.fn()
      }
    }
  }),
  { virtual: true }
);

// Now require your real upload router (it will see the mocked cloudinary)
const uploadRoutes = require("../../server/routes/upload");

describe("Cloudinary upload integration (mocked)", () => {
  let app;

  beforeEach(() => {
    // Fresh minimal app per test
    app = express();
    app.use("/api/upload", uploadRoutes);

    mockUploadStream.mockReset();

    // Default: simulate successful cloudinary response
    mockUploadStream.mockImplementation((_options, cb) => {
      return {
        end: (_buffer) => {
          cb(null, {
            secure_url: "https://res.cloudinary.com/demo/image/upload/v1/test.png",
            public_id: "unifreelancer/courses/test"
          });
        }
      };
    });
  });

  test("POST /api/upload/image returns 400 if no file is uploaded", async () => {
    const res = await request(app).post("/api/upload/image");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "No file uploaded");
  });

  test("POST /api/upload/image uploads an image and returns Cloudinary URL + publicId", async () => {
    const res = await request(app)
      .post("/api/upload/image")
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "avatar.png",
        contentType: "image/png"
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      url: "https://res.cloudinary.com/demo/image/upload/v1/test.png",
      publicId: "unifreelancer/courses/test"
    });

    expect(mockUploadStream).toHaveBeenCalledTimes(1);
    const [options] = mockUploadStream.mock.calls[0];
    expect(options).toMatchObject({
      folder: "unifreelancer/courses",
      resource_type: "image"
    });
  });

  test("POST /api/upload/image returns 500 if Cloudinary fails", async () => {
    // Silence expected error log for this test
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockUploadStream.mockImplementation((_options, cb) => {
      return {
        end: (_buffer) => cb(new Error("Cloudinary failed"), null)
      };
    });

    const res = await request(app)
      .post("/api/upload/image")
      .attach("image", Buffer.from("fake-image-bytes"), {
        filename: "avatar.png",
        contentType: "image/png"
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");

    spy.mockRestore();
  });
});