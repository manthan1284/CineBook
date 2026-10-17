const Booking = require('../models/Booking');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard aggregated statistics and chart data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalShows = await Show.countDocuments({ isActive: true });
    const totalTheatres = await Theatre.countDocuments({ isActive: true });
    const totalMovies = await Movie.countDocuments();

    // Total Revenue calculation (sum of confirmed bookings totalAmount)
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Today's Date string 'YYYY-MM-DD'
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookingsAgg = await Booking.aggregate([
      {
        $match: {
          bookingStatus: 'confirmed',
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
    ]);
    const todayBookingsCount = todayBookingsAgg.length > 0 ? todayBookingsAgg[0].count : 0;
    const todayRevenue = todayBookingsAgg.length > 0 ? todayBookingsAgg[0].revenue : 0;

    // Daily Revenue for the last 7 days (for chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrendsAgg = await Booking.aggregate([
      {
        $match: {
          bookingStatus: 'confirmed',
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format last 7 days with fallbacks for missing days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const found = dailyTrendsAgg.find((item) => item._id === dateStr);
      last7Days.push({
        date: dateStr,
        label: dayLabel,
        revenue: found ? found.revenue : 0,
        bookings: found ? found.bookings : 0,
      });
    }

    // Top Grossing Movies
    const topMoviesAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$movieId',
          totalRevenue: { $sum: '$totalAmount' },
          ticketsSold: { $sum: { $size: '$seats' } },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      {
        $project: {
          title: '$movie.title',
          posterUrl: '$movie.posterUrl',
          totalRevenue: 1,
          ticketsSold: 1,
          bookingsCount: 1,
        },
      },
    ]);

    // Recent 10 Bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('movieId', 'title posterUrl')
      .populate('theatreId', 'name city')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalUsers,
        totalShows,
        totalTheatres,
        totalMovies,
        todayRevenue,
        todayBookingsCount,
      },
      chartData: {
        dailyRevenue: last7Days,
        topMovies: topMoviesAgg,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with pagination and filters
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
        { showDate: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('movieId', 'title posterUrl')
      .populate('theatreId', 'name city')
      .populate('screenId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Attach booking counts for users
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const bookingsCount = await Booking.countDocuments({ userId: u._id });
        return {
          ...u.toObject(),
          bookingsCount,
        };
      })
    );

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or unblock user account
// @route   PUT /api/admin/users/:id/toggle-block
// @access  Private/Admin
const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block an administrator account.',
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payment transactions
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: [
          { path: 'movieId', select: 'title' },
          { path: 'theatreId', select: 'name city' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export bookings as CSV
// @route   GET /api/admin/export/bookings
// @access  Private/Admin
const exportBookingsCSV = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('movieId', 'title')
      .populate('theatreId', 'name city')
      .populate('screenId', 'name')
      .sort({ createdAt: -1 });

    let csv = 'Booking ID,Customer Name,Email,Phone,Movie,Theatre,City,Screen,Date,Time,Seats,Total Amount (INR),Status,Created At\n';

    bookings.forEach((b) => {
      const seatsStr = b.seats.map((s) => s.seatNumber).join(';');
      const customerName = (b.userId && b.userId.name) ? b.userId.name.replace(/,/g, '') : 'Guest';
      const customerEmail = (b.userId && b.userId.email) ? b.userId.email : 'N/A';
      const customerPhone = (b.userId && b.userId.phone) ? b.userId.phone : 'N/A';
      const movieTitle = (b.movieId && b.movieId.title) ? b.movieId.title.replace(/,/g, '') : 'N/A';
      const theatreName = (b.theatreId && b.theatreId.name) ? b.theatreId.name.replace(/,/g, '') : 'N/A';
      const city = (b.theatreId && b.theatreId.city) ? b.theatreId.city : 'N/A';
      const screenName = (b.screenId && b.screenId.name) ? b.screenId.name : 'N/A';
      const createdAt = new Date(b.createdAt).toISOString();

      csv += `${b.bookingId},"${customerName}",${customerEmail},${customerPhone},"${movieTitle}","${theatreName}",${city},"${screenName}",${b.showDate},${b.showTime},"${seatsStr}",${b.totalAmount},${b.bookingStatus},${createdAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cinebook_bookings_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export revenue as CSV
// @route   GET /api/admin/export/revenue
// @access  Private/Admin
const exportRevenueCSV = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        select: 'bookingId showDate showTime totalAmount',
      })
      .sort({ createdAt: -1 });

    let csv = 'Payment ID,Transaction Ref,Booking ID,Customer,Amount (INR),Method,Status,Date\n';

    payments.forEach((p) => {
      const cust = p.userId ? p.userId.name.replace(/,/g, '') : 'N/A';
      const bId = p.bookingId ? p.bookingId.bookingId : 'N/A';
      csv += `${p.paymentId},${p.transactionRef || 'N/A'},${bId},"${cust}",${p.amount},${p.method},${p.status},${new Date(p.createdAt).toISOString()}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cinebook_financial_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  toggleUserBlock,
  getAllPayments,
  exportBookingsCSV,
  exportRevenueCSV,
};
