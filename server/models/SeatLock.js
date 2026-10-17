const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    seatNumbers: {
      type: [String],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically remove locks when expiresAt timestamp is reached
seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
seatLockSchema.index({ showId: 1, seatNumbers: 1 });

module.exports = mongoose.model('SeatLock', seatLockSchema);
