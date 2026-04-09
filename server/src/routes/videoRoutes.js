const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  uploadVideo,
  processVideo,
  getVideoStatus,
  getAllVideos,
  getVideoById,
  deleteVideo,
} = require('../controllers/videoController');

router.get('/', getAllVideos);
router.post('/upload', upload.single('video'), uploadVideo);
router.get('/:id', getVideoById);
router.post('/:id/process', processVideo);
router.get('/:id/status', getVideoStatus);
router.delete('/:id', deleteVideo);

module.exports = router;