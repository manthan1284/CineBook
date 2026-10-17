const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX Laser', '4DX', 'Dolby Atmos', 'Gold Class'],
      default: 'Standard',
    },
    totalSeats: {
      type: Number,
      default: 160,
    },
    layoutConfig: {
      rows: {
        type: [String],
        default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      },
      cols: {
        type: Number,
        default: 16,
      },
      aisleIndices: {
        type: [Number],
        default: [4, 12], // Gap after seat 4 and seat 12
      },
      tiers: [
        {
          name: {
            type: String,
            enum: ['Platinum', 'Gold', 'Silver'],
            required: true,
          },
          rows: [String],
          basePrice: Number,
        },
      ],
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

module.exports = mongoose.model('Screen', screenSchema);
