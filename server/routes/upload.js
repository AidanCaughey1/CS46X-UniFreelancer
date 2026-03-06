const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify config on startup
console.log('📸 Cloudinary Configuration:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Upload endpoint with detailed logging
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    console.log('\n=== 📤 UPLOAD REQUEST RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    if (!req.file) {
      console.error('❌ ERROR: No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('✓ File received:');
    console.log('  - Name:', req.file.originalname);
    console.log('  - Size:', req.file.size, 'bytes');
    console.log('  - Type:', req.file.mimetype);
    console.log('  - Buffer length:', req.file.buffer.length);

    console.log('\n🚀 Starting Cloudinary upload...');

    // Upload to Cloudinary using buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'unifreelancer/courses',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 675, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('\n❌ CLOUDINARY ERROR:');
            console.error('  - Message:', error.message);
            console.error('  - HTTP Code:', error.http_code);
            console.error('  - Full Error:', JSON.stringify(error, null, 2));
            reject(error);
          } else {
            console.log('\n✅ Upload successful!');
            console.log('  - URL:', result.secure_url);
            console.log('  - Public ID:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('\n❌ UPLOAD ROUTE ERROR:');
    console.error('  - Type:', error.constructor.name);
    console.error('  - Message:', error.message);
    console.error('  - Stack:', error.stack);
    
    res.status(500).json({ 
      error: error.message || 'Failed to upload image',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
});

// Delete endpoint (optional, for cleanup)
router.delete('/image/:publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/_/g, '/');
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;