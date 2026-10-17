const Feedback = require('../models/Feedback');
const Movie = require('../models/Movie');

// @desc    Get approved feedback for a movie
// @route   GET /api/feedback/movie/:movieId
// @access  Public
const getMovieFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({
      movieId: req.params.movieId,
      isApproved: true,
    })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a movie
// @route   POST /api/feedback
// @access  Private
const addFeedback = async (req, res, next) => {
  try {
    const { movieId, rating, comment } = req.body;

    if (!movieId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, star rating (1-5), and review text.',
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    // Check if user already reviewed this movie, update if so
    let feedback = await Feedback.findOne({
      userId: req.user._id,
      movieId,
    });

    if (feedback) {
      feedback.rating = rating;
      feedback.comment = comment;
      await feedback.save();
    } else {
      feedback = await Feedback.create({
        userId: req.user._id,
        movieId,
        rating,
        comment,
      });
    }

    // Recalculate movie average rating
    const allReviews = await Feedback.find({ movieId, isApproved: true });
    if (allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      movie.imdbRating = Math.round(avg * 2 * 10) / 10; // scaled to 10
      movie.likesPercentage = Math.round((allReviews.filter((r) => r.rating >= 3).length / allReviews.length) * 100);
      await movie.save();
    }

    const populated = await Feedback.findById(feedback._id).populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      feedback: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback for admin moderation
// @route   GET /api/feedback/admin
// @access  Private/Admin
const getAllFeedback = async (req, res, next) => {
  try {
    const reviews = await Feedback.find()
      .populate('userId', 'name email avatar')
      .populate('movieId', 'title posterUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or toggle approval of review
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
const deleteFeedback = async (req, res, next) => {
  try {
    const review = await Feedback.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review moderated and removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovieFeedback,
  addFeedback,
  getAllFeedback,
  deleteFeedback,
};
