const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  toggleUserBlock,
  getAllPayments,
  exportBookingsCSV,
  exportRevenueCSV,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-block', toggleUserBlock);
router.get('/payments', getAllPayments);
router.get('/export/bookings', exportBookingsCSV);
router.get('/export/revenue', exportRevenueCSV);

module.exports = router;
