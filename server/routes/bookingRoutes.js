const express = require('express');
const router = express.Router();
const {
  lockSeats,
  releaseSeats,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/lock-seats', protect, lockSeats);
router.post('/release-seats', protect, releaseSeats);
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
