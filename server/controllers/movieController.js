const Movie = require('../models/Movie');
const Feedback = require('../models/Feedback');

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { status, genre, language, search, format, sort } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }

    if (language && language !== 'All') {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }

    if (format && format !== 'All') {
      query.formats = { $in: [format] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { synopsis: { $regex: search, $options: 'i' } },
        { genres: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let sortOptions = { releaseDate: -1 };
    if (sort === 'rating') {
      sortOptions = { imdbRating: -1 };
    } else if (sort === 'popularity') {
      sortOptions = { likesPercentage: -1 };
    }

    const movies = await Movie.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured movies for hero carousel slider
// @route   GET /api/movies/featured
// @access  Public
const getFeaturedMovies = async (req, res, next) => {
  try {
    const featured = await Movie.find({ isFeatured: true, status: 'now_showing' });

    // Pin Wakanda Forever as the primary slide matching reference design
    featured.sort((a, b) => {
      if (a.title.toLowerCase().includes('wakanda')) return -1;
      if (b.title.toLowerCase().includes('wakanda')) return 1;
      return 0;
    });

    res.json({
      success: true,
      movies: featured,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID or slug
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let movie;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(id);
    } else {
      movie = await Movie.findOne({ slug: id });
    }

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found with the requested identifier',
      });
    }

    // Fetch verified reviews
    const reviews = await Feedback.find({ movieId: movie._id, isApproved: true })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      movie,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movieData = req.body;

    // Handle uploaded poster if present
    if (req.file) {
      movieData.posterUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof movieData.genres === 'string') {
      movieData.genres = movieData.genres.split(',').map((g) => g.trim());
    }
    if (typeof movieData.languages === 'string') {
      movieData.languages = movieData.languages.split(',').map((l) => l.trim());
    }
    if (typeof movieData.formats === 'string') {
      movieData.formats = movieData.formats.split(',').map((f) => f.trim());
    }

    const movie = await Movie.create(movieData);

    res.status(201).json({
      success: true,
      message: 'Movie added successfully.',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movieData = req.body;

    if (req.file) {
      movieData.posterUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof movieData.genres === 'string') {
      movieData.genres = movieData.genres.split(',').map((g) => g.trim());
    }
    if (typeof movieData.languages === 'string') {
      movieData.languages = movieData.languages.split(',').map((l) => l.trim());
    }
    if (typeof movieData.formats === 'string') {
      movieData.formats = movieData.formats.split(',').map((f) => f.trim());
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, movieData, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found to update',
      });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully.',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found to delete',
      });
    }

    res.json({
      success: true,
      message: 'Movie removed from CineBook catalog.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
