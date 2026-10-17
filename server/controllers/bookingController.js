const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const Show = require('../models/Show');
const Payment = require('../models/Payment');

// Helper to calculate hours until showtime
const getHoursUntilShow = (showDateStr, startTimeStr) => {
  try {
    const [year, month, day] = showDateStr.split('-').map(Number);
    const cleaned = startTimeStr.trim().toUpperCase();
    const isPM = cleaned.includes('PM');
    const isAM = cleaned.includes('AM');
    const parts = cleaned.replace('AM', '').replace('PM', '').trim().split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    const showDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    const diffMs = showDateTime.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  } catch (err) {
    return 24; // fallback safe
  }
};

// @desc    Lock selected seats for 8 minutes during checkout
// @route   POST /api/bookings/lock-seats
// @access  Private
const lockSeats = async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat to reserve.',
      });
    }

    if (seatNumbers.length > 8) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 8 seats can be selected per booking reservation.',
      });
    }

    const show = await Show.findById(showId);
    if (!show || !show.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Show not found or is currently inactive.',
      });
    }

    // 1. Check if any seat is blocked by admin
    const isBlocked = seatNumbers.some((seat) => show.blockedSeats.includes(seat));
    if (isBlocked) {
      return res.status(400).json({
        success: false,
        message: 'One or more of the selected seats are reserved or under maintenance.',
      });
    }

    // 2. Check if already booked in confirmed bookings
    const confirmedBookings = await Booking.find({
      showId,
      bookingStatus: 'confirmed',
      'seats.seatNumber': { $in: seatNumbers },
    });

    if (confirmedBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Sorry! One or more of the selected seats have just been booked by another guest.',
      });
    }

    // 3. Check if currently locked by ANOTHER user
    const existingLocks = await SeatLock.find({
      showId,
      userId: { $ne: req.user._id },
      expiresAt: { $gt: new Date() },
      seatNumbers: { $in: seatNumbers },
    });

    if (existingLocks.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'One or more seats are currently on hold by another guest. Please pick other seats.',
      });
    }

    // Clear any previous lock for this user on this show
    await SeatLock.deleteMany({ showId, userId: req.user._id });

    // Set expiration 8 minutes from now
    const expiresAt = new Date(Date.now() + 8 * 60 * 1000);

    const newLock = await SeatLock.create({
      showId,
      seatNumbers,
      userId: req.user._id,
      expiresAt,
    });

    res.json({
      success: true,
      message: 'Seats reserved successfully for checkout.',
      expiresAt,
      lockId: newLock._id,
      seatNumbers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Release locked seats if user cancels or backs out
// @route   POST /api/bookings/release-seats
// @access  Private
const releaseSeats = async (req, res, next) => {
  try {
    const { showId } = req.body;
    await SeatLock.deleteMany({ showId, userId: req.user._id });
    res.json({
      success: true,
      message: 'Held seats released successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking and process simulated payment
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      showId,
      seats,
      fnbItems = [],
      promoCode,
      paymentMethod = 'UPI',
      paymentDetails = {},
    } = req.body;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data. Please provide show and seat information.',
      });
    }

    if (seats.length > 8) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 8 seats allowed per booking.',
      });
    }

    const show = await Show.findById(showId)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    const seatNumbers = seats.map((s) => s.seatNumber);

    // Double check seats are not already booked
    const alreadyBooked = await Booking.findOne({
      showId,
      bookingStatus: 'confirmed',
      'seats.seatNumber': { $in: seatNumbers },
    });

    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: 'Seats were taken before checkout finished. Please choose other seats.',
      });
    }

    // Calculate subtotal from seats
    const seatSubtotal = seats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);

    // Calculate F&B subtotal
    const fnbSubtotal = fnbItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const subtotal = seatSubtotal + fnbSubtotal;

    // Convenience fee: ₹30 per ticket + 18% GST on convenience fee
    const convenienceFee = Math.round(seats.length * 30 * 1.18);

    // Discount computation
    let discount = 0;
    if (promoCode) {
      const code = promoCode.trim().toUpperCase();
      if (code === 'CINEFIRST') {
        discount = Math.min(150, Math.round(subtotal * 0.15));
      } else if (code === 'BLOCKBUSTER' && subtotal >= 500) {
        discount = 100;
      } else if (code === 'WEEKEND20') {
        discount = Math.min(250, Math.round(subtotal * 0.2));
      }
    }

    const totalAmount = Math.max(0, subtotal + convenienceFee - discount);

    // Generate unique human-readable booking ID: e.g. CNB-749102
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `CNB-${randomDigits}`;

    // Payload for QR Code
    const qrCodeData = JSON.stringify({
      bookingId,
      movie: show.movieId.title,
      theatre: show.theatreId.name,
      screen: show.screenId.name,
      date: show.showDate,
      time: show.startTime,
      seats: seatNumbers,
      amount: totalAmount,
      user: req.user.name,
    });

    const paymentId = `PAY-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const booking = await Booking.create({
      bookingId,
      userId: req.user._id,
      showId: show._id,
      movieId: show.movieId._id,
      theatreId: show.theatreId._id,
      screenId: show.screenId._id,
      showDate: show.showDate,
      showTime: show.startTime,
      seats,
      fnbItems,
      subtotal,
      convenienceFee,
      discount,
      totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      paymentId,
      paymentMethod,
      qrCodeData,
    });

    // Create Payment record
    await Payment.create({
      paymentId,
      bookingId: booking._id,
      userId: req.user._id,
      amount: totalAmount,
      currency: 'INR',
      method: paymentMethod,
      status: 'success',
      transactionRef: `TXN-${Date.now()}`,
      paymentGatewayDetails: paymentDetails,
    });

    // Remove user's temporary seat lock
    await SeatLock.deleteMany({ showId, userId: req.user._id });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    res.status(201).json({
      success: true,
      message: 'Ticket booking confirmed successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings of current user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('movieId', 'title posterUrl duration certificate languages formats')
      .populate('theatreId', 'name city address')
      .populate('screenId', 'name screenType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID or booking reference
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking;

    if (id.startsWith('CNB-')) {
      booking = await Booking.findOne({ bookingId: id })
        .populate('movieId')
        .populate('theatreId')
        .populate('screenId')
        .populate('userId', 'name email phone');
    } else {
      booking = await Booking.findById(id)
        .populate('movieId')
        .populate('theatreId')
        .populate('screenId')
        .populate('userId', 'name email phone');
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization: booking owner or admin
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking.',
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking and compute refund
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Owner or admin
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking.',
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    const hoursUntilShow = getHoursUntilShow(booking.showDate, booking.showTime);

    if (hoursUntilShow < 0) {
      return res.status(400).json({
        success: false,
        message: 'Show has already started or ended. Passed shows cannot be cancelled.',
      });
    }

    // Refund policy:
    // >= 24 hours before show: 75% refund of ticket total
    // 2 to 24 hours before show: 50% refund of ticket total
    // < 2 hours: non-refundable
    let refundPercentage = 0;
    if (hoursUntilShow >= 24) {
      refundPercentage = 75;
    } else if (hoursUntilShow >= 2) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100);

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = refundAmount > 0 ? 'refunded' : 'paid';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    booking.refundStatus = refundAmount > 0 ? 'processed' : 'none';

    await booking.save();

    // Record refund payment entry if applicable
    if (refundAmount > 0) {
      await Payment.create({
        paymentId: `REF-${Date.now().toString().slice(-6)}`,
        bookingId: booking._id,
        userId: booking.userId,
        amount: refundAmount,
        currency: 'INR',
        method: booking.paymentMethod,
        status: 'refunded',
        transactionRef: `REFUND-TXN-${Date.now()}`,
      });
    }

    res.json({
      success: true,
      message: `Booking cancelled successfully. ${
        refundAmount > 0
          ? `₹${refundAmount} (${refundPercentage}%) refund processed to original payment method.`
          : 'Non-refundable as cancellation was within 2 hours of showtime.'
      }`,
      booking,
      refundAmount,
      refundPercentage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  lockSeats,
  releaseSeats,
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};
