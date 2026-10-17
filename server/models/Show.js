const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    showDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
      index: true,
    },
    startTime: {
      type: String, // '10:30 AM' or '19:45'
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      default: '2D',
    },
    language: {
      type: String,
      default: 'English',
    },
    pricing: {
      platinum: {
        type: Number,
        default: 450,
      },
      gold: {
        type: Number,
        default: 280,
      },
      silver: {
        type: Number,
        default: 180,
      },
    },
    blockedSeats: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help fast lookup of shows for a movie/theatre on a given date
showSchema.index({ movieId: 1, showDate: 1 });
showSchema.index({ theatreId: 1, showDate: 1 });
showSchema.index({ screenId: 1, showDate: 1, startTime: 1 });

module.exports = mongoose.model('Show', showSchema);
