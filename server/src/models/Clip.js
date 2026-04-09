const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    clipUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    startTime: {
      type: Number, // seconds
      required: true,
    },
    endTime: {
      type: Number, // seconds
      required: true,
    },
    duration: {
      type: Number, // seconds
      required: true,
    },
    engagementScore: {
      type: Number, // 0-100 AI score
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    aiReason: {
      type: String, // Why AI selected this segment
      default: '',
    },
    order: {
      type: Number, // clip order / ranking
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Clip', clipSchema);