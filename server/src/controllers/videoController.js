const asyncHandler = require('../utils/asyncHandler');
const Video = require('../models/Video');
const Clip = require('../models/Clip');
const { cloudinary } = require('../config/cloudinary');
const pythonService = require('../services/pythonService');

const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No video file provided' });
  }

  const { title } = req.body;

  const video = await Video.create({
    title: title || req.file.originalname,
    originalUrl: req.file.path,
    cloudinaryPublicId: req.file.filename,
    fileSize: req.file.size || 0,
    format: req.file.mimetype?.split('/')[1] || 'mp4',
    thumbnailUrl: cloudinary.url(req.file.filename, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [{ start_offset: '5' }],
    }),
    metadata: {
      width: req.file.width,
      height: req.file.height,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully',
    data: video,
  });
});

const processVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  if (video.status === 'processing') {
    return res.status(400).json({ success: false, message: 'Video is already being processed' });
  }

  video.status = 'processing';
  await video.save();

  pythonService
    .processVideo({
      videoId: video._id.toString(),
      videoUrl: video.originalUrl,
      title: video.title,
    })
    .then(async (result) => {
      console.log("\n" + "=".repeat(60));
      console.log("CRITICAL DEBUG: AI RESPONSE RECEIVED");
      console.log(JSON.stringify({
        hasClips: !!result.clips,
        clipsCount: result.clips?.length,
        hasTranscript: !!result.transcript
      }, null, 2));
      console.log("=".repeat(60) + "\n");

      const { clips, transcript, ai_segments } = result;

      if (!clips || clips.length === 0) {
        throw new Error("No clips received from AI service. The analysis failed to produce highlights.");
      }

      const savedClips = await Clip.insertMany(
        clips.map((clip, index) => {
          return {
            videoId: video._id,
            title: clip.title || `Clip ${index + 1}`,
            description: clip.description || '',
            clipUrl: clip.clipUrl,
            cloudinaryPublicId: clip.cloudinaryPublicId,
            thumbnailUrl: clip.thumbnailUrl || '',
            startTime: clip.start || clip.start_time || 0,
            endTime: clip.end || clip.end_time || 0,
            duration: clip.duration || 0,
            engagementScore: clip.viral_score || 0,
            viralScore: clip.viral_score || 0,
            emotion: clip.emotion || 'neutral',
            category: clip.category || 'entertainment',
            keywords: clip.keywords || [],
            aiReason: clip.reason || '',
            whyThisPart: clip.why_this_part || '',
            confidence: clip.confidence || 0,
            analysis: clip.analysis || {},
            order: index,
          };
        })
      );

      video.clips = savedClips.map((c) => c._id);
      video.transcript = transcript;
      video.aiSegments = ai_segments;
      video.status = 'completed';
      video.processingError = null;
      await video.save();
      console.log(`✅ DB SUCCESS: Saved ${savedClips.length} clips for Video ${video._id}`);
    })
    .catch(async (error) => {
      // Re-fetch video to check current state
      const currentVideo = await Video.findById(video._id);
      if (currentVideo.clips.length > 0) {
        console.log("⚠️ WARNING: AI process error but clips exist. Marking as completed instead of failed.");
        currentVideo.status = 'completed';
      } else {
        currentVideo.status = 'failed';
        currentVideo.processingError = error.message;
      }
      await currentVideo.save();
      console.error(`❌ BACKEND ERROR:`, error.message);
    });


  res.json({
    success: true,
    message: 'Video processing started. Poll /api/videos/:id/status for updates.',
    data: { videoId: video._id, status: 'processing' },
  });
});

const getVideoStatus = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).select('status processingError clips title');

  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  console.log(`📡 RETURNING STATUS: ${video.status} for ${video._id}. Clips: ${video.clips.length}`);
  res.json({
    success: true,
    data: {
      status: video.status,
      clipCount: video.clips.length,
      error: video.processingError,
    },
  });
});


const getAllVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const videos = await Video.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('clips', 'title duration engagementScore thumbnailUrl');

  const total = await Video.countDocuments();

  res.json({
    success: true,
    data: videos,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('clips');

  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  console.log(`📡 RETURNING FULL DATA for ${video._id}. Status: ${video.status}, Clips: ${video.clips?.length}`);
  res.json({ success: true, data: video });
});


const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate('clips');

  if (!video) {
    return res.status(404).json({ success: false, message: 'Video not found' });
  }

  await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' });

  for (const clip of video.clips) {
    await cloudinary.uploader.destroy(clip.cloudinaryPublicId, { resource_type: 'video' });
  }

  await Clip.deleteMany({ videoId: video._id });
  await video.deleteOne();

  res.json({ success: true, message: 'Video and all clips deleted successfully' });
});

module.exports = {
  uploadVideo,
  processVideo,
  getVideoStatus,
  getAllVideos,
  getVideoById,
  deleteVideo,
};