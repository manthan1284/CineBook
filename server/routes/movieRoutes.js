const express = require('express');
const router = express.Router();
const {
  getMovies,
  getFeaturedMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getMovies);
router.get('/featured', getFeaturedMovies);
router.get('/:id', getMovieById);

router.post('/', protect, admin, upload.single('poster'), createMovie);
router.put('/:id', protect, admin, upload.single('poster'), updateMovie);
router.delete('/:id', protect, admin, deleteMovie);

module.exports = router;
