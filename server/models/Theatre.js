const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Theatre address is required'],
    },
    locationMapUrl: {
      type: String,
      default: '',
    },
    amenities: {
      type: [String],
      default: ['Dolby Atmos', '4K Projection', 'Food Court', 'Wheelchair Accessible', 'Parking'],
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

module.exports = mongoose.model('Theatre', theatreSchema);
