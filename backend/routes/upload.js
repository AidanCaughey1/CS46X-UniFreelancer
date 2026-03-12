const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    return cb(null, true);
  },
});

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!hasCloudinaryConfig) {
      return res.status(501).json({ error: "Cloudinary upload is not configured" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "unifreelancer/courses",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 675, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(uploadResult);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("UPLOAD ROUTE ERROR:", error);
    res.status(500).json({
      error: error.message || "Failed to upload image",
    });
  }
});

router.delete("/image/:publicId", async (req, res) => {
  try {
    if (!hasCloudinaryConfig) {
      return res.status(501).json({ error: "Cloudinary upload is not configured" });
    }

    const publicId = req.params.publicId.replace(/_/g, "/");
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

module.exports = router;
