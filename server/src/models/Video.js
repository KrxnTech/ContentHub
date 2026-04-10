const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    originalUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
    format: {
      type: String,
      default: 'mp4',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
    processingError: {
      type: String,
      default: null,
    },
    clips: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clip',
      },
    ],
    metadata: {
      width: Number,
      height: Number,
      fps: Number,
      bitrate: Number,
    },
    transcript: [
      {
        text: String,
        start: Number,
        end: Number,
      },
    ],
    aiSegments: [
      {
        start: Number,
        end: Number,
        score: Number,
        analysis: {
          text_importance: Number,
          emotion_intensity: Number,
          audio_energy: Number,
          topic_shift: Boolean,
          keyword_density: Number,
        },
      },
    ],

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Video', videoSchema);