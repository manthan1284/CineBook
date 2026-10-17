const express = require('express');
const router = express.Router();
const {
  getMovieFeedback,
  addFeedback,
  getAllFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/movie/:movieId', getMovieFeedback);
router.post('/', protect, addFeedback);

// Admin moderation
router.get('/admin', protect, admin, getAllFeedback);
router.delete('/:id', protect, admin, deleteFeedback);

module.exports = router;
