const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    synopsis: {
      type: String,
      required: [true, 'Movie plot/synopsis is required'],
    },
    duration: {
      type: Number, // duration in minutes
      required: true,
      default: 120,
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    genres: {
      type: [String],
      default: ['Action'],
    },
    certificate: {
      type: String,
      default: 'UA',
    },
    formats: {
      type: [String],
      default: ['2D', '3D', 'IMAX'],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      required: true,
    },
    backdropUrl: {
      type: String,
      required: true,
    },
    imdbRating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    likesPercentage: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
    cast: [
      {
        name: String,
        role: String,
        photo: String,
      },
    ],
    director: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.pre('save', function () {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Movie', movieSchema);
