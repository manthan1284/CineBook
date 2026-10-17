const express = require('express');
const router = express.Router();
const {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
  getScreens,
  createScreen,
  updateScreen,
  deleteScreen,
} = require('../controllers/theatreController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getTheatres);
router.get('/:id', getTheatreById);
router.post('/', protect, admin, createTheatre);
router.put('/:id', protect, admin, updateTheatre);
router.delete('/:id', protect, admin, deleteTheatre);

// Screen routes
router.get('/:theatreId/screens', getScreens);
router.post('/screens', protect, admin, createScreen);
router.put('/screens/:id', protect, admin, updateScreen);
router.delete('/screens/:id', protect, admin, deleteScreen);

module.exports = router;
