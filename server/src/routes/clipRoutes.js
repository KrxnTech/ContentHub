const express = require('express');
const router = express.Router();
const { getClipsByVideo, getClipById, deleteClip } = require('../controllers/clipController');

router.get('/video/:videoId', getClipsByVideo);
router.get('/:id', getClipById);
router.delete('/:id', deleteClip);

module.exports = router;