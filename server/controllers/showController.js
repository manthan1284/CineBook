const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const jwt = require('jsonwebtoken');

// Helper to convert time strings like "10:30 AM" or "14:15" to minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');

  const parts = cleaned.replace('AM', '').replace('PM', '').trim().split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// @desc    Get all shows with filters (movie, theatre, city, date)
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, city, showDate } = req.query;
    let query = { isActive: true };

    if (movieId) query.movieId = movieId;
    if (theatreId) query.theatreId = theatreId;
    if (showDate) query.showDate = showDate;

    let shows = await Show.find(query)
      .populate('movieId', 'title posterUrl duration languages certificate formats')
      .populate('theatreId', 'name city address amenities')
      .populate('screenId', 'name screenType totalSeats layoutConfig')
      .sort({ showDate: 1, startTime: 1 });

    // Filter by city if specified
    if (city && city !== 'All') {
      shows = shows.filter(
        (show) =>
          show.theatreId &&
          show.theatreId.city &&
          show.theatreId.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details with real-time seat availability
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // Extract optional current user from token if passed
    let currentUserId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'cinebook_super_secret_jwt_key_2026_cinematic_experience'
        );
        currentUserId = decoded.id;
      } catch (e) {
        // Guest or expired token
      }
    }

    // 1. Fetch confirmed booked seats
    const confirmedBookings = await Booking.find({
      showId: show._id,
      bookingStatus: 'confirmed',
    }).select('seats');

    const bookedSeatNumbers = [];
    confirmedBookings.forEach((b) => {
      b.seats.forEach((s) => bookedSeatNumbers.push(s.seatNumber));
    });

    // 2. Fetch active seat locks (exclude expired)
    const activeLocks = await SeatLock.find({
      showId: show._id,
      expiresAt: { $gt: new Date() },
    });

    const lockedSeatNumbers = [];
    const myLockedSeats = [];

    activeLocks.forEach((lock) => {
      const isMine = currentUserId && lock.userId.toString() === currentUserId.toString();
      lock.seatNumbers.forEach((seat) => {
        if (isMine) {
          myLockedSeats.push(seat);
        } else {
          lockedSeatNumbers.push(seat);
        }
      });
    });

    res.json({
      success: true,
      show,
      seatStatus: {
        booked: bookedSeatNumbers,
        locked: lockedSeatNumbers, // locked by other users
        myLocked: myLockedSeats,   // locked by this user
        blocked: show.blockedSeats || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new show (with overlap validation)
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const {
      movieId,
      theatreId,
      screenId,
      showDate,
      startTime,
      endTime,
      format,
      language,
      pricing,
    } = req.body;

    if (!movieId || !theatreId || !screenId || !showDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required show parameters.',
      });
    }

    const newStartMins = timeToMinutes(startTime);
    const newEndMins = timeToMinutes(endTime);

    if (newEndMins <= newStartMins) {
      return res.status(400).json({
        success: false,
        message: 'Show end time must be after the start time.',
      });
    }

    // Check for overlapping shows on the same screen and date
    const existingShows = await Show.find({
      screenId,
      showDate,
      isActive: true,
    }).populate('movieId', 'title');

    for (const existing of existingShows) {
      const existingStart = timeToMinutes(existing.startTime);
      const existingEnd = timeToMinutes(existing.endTime);

      // Add a 20-minute buffer for cinema cleaning/intermission between shows
      if (newStartMins < existingEnd + 15 && newEndMins + 15 > existingStart) {
        return res.status(409).json({
          success: false,
          message: `Show time conflict! The screen is already booked for "${existing.movieId ? existing.movieId.title : 'Another Movie'}" between ${existing.startTime} and ${existing.endTime} (including cleanup interval).`,
        });
      }
    }

    const show = await Show.create({
      movieId,
      theatreId,
      screenId,
      showDate,
      startTime,
      endTime,
      format: format || '2D',
      language: language || 'English',
      pricing: pricing || { platinum: 450, gold: 280, silver: 180 },
    });

    const populatedShow = await Show.findById(show._id)
      .populate('movieId', 'title posterUrl')
      .populate('theatreId', 'name city')
      .populate('screenId', 'name screenType');

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully without conflicts.',
      show: populatedShow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found to update',
      });
    }

    res.json({
      success: true,
      message: 'Show details updated successfully.',
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found to delete',
      });
    }

    res.json({
      success: true,
      message: 'Show deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or Unblock a seat for a show (VIP hold / broken seat)
// @route   POST /api/shows/:id/toggle-block-seat
// @access  Private/Admin
const toggleBlockSeat = async (req, res, next) => {
  try {
    const { seatNumber } = req.body;
    if (!seatNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the seatNumber to toggle.',
      });
    }

    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const index = show.blockedSeats.indexOf(seatNumber);
    let isBlockedNow = false;

    if (index > -1) {
      show.blockedSeats.splice(index, 1);
      isBlockedNow = false;
    } else {
      show.blockedSeats.push(seatNumber);
      isBlockedNow = true;
    }

    await show.save();

    res.json({
      success: true,
      message: `Seat ${seatNumber} is now ${isBlockedNow ? 'blocked' : 'unblocked'}.`,
      blockedSeats: show.blockedSeats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  toggleBlockSeat,
};
