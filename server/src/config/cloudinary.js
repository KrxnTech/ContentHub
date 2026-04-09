const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'video-clipper/originals',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    eager: [{ quality: 'auto' }],
    eager_async: true,
  },
});


const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    // Accept by extension if MIME type is unreliable (Postman sends octet-stream)
    const allowedMimes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska',
      'application/octet-stream', // ✅ Postman fix
    ];

    const allowedExtensions = /\.(mp4|mov|avi|mkv|webm)$/i;
    const extOk = allowedExtensions.test(file.originalname);
    const mimeOk = allowedMimes.includes(file.mimetype);

    if (extOk || mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  },
});

module.exports = { cloudinary, upload };