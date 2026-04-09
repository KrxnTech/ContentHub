const asyncHandler = require('../utils/asyncHandler');
const Clip = require('../models/Clip');
const { cloudinary } = require('../config/cloudinary');

const getClipsByVideo = asyncHandler(async (req, res) => {
  const clips = await Clip.find({ videoId: req.params.videoId }).sort({ engagementScore: -1 });
  res.json({ success: true, count: clips.length, data: clips });
});

const getClipById = asyncHandler(async (req, res) => {
  const clip = await Clip.findById(req.params.id).populate('videoId', 'title');

  if (!clip) {
    return res.status(404).json({ success: false, message: 'Clip not found' });
  }

  res.json({ success: true, data: clip });
});

const deleteClip = asyncHandler(async (req, res) => {
  const clip = await Clip.findById(req.params.id);

  if (!clip) {
    return res.status(404).json({ success: false, message: 'Clip not found' });
  }

  await cloudinary.uploader.destroy(clip.cloudinaryPublicId, { resource_type: 'video' });
  await clip.deleteOne();

  res.json({ success: true, message: 'Clip deleted successfully' });
});

module.exports = { getClipsByVideo, getClipById, deleteClip };