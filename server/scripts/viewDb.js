const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cinebook';
  console.log(`Connecting to: ${uri}\n`);

  try {
    await mongoose.connect(uri);
    console.log('=== CINEBOOK DATABASE SUMMARY ===\n');

    const [userCount, movieCount, theatreCount, screenCount, showCount, bookingCount, paymentCount, feedbackCount] =
      await Promise.all([
        User.countDocuments(),
        Movie.countDocuments(),
        Theatre.countDocuments(),
        Screen.countDocuments(),
        Show.countDocuments(),
        Booking.countDocuments(),
        Payment.countDocuments(),
        Feedback.countDocuments(),
      ]);

    console.table([
      { Collection: 'Users', Count: userCount },
      { Collection: 'Movies', Count: movieCount },
      { Collection: 'Theatres', Count: theatreCount },
      { Collection: 'Screens', Count: screenCount },
      { Collection: 'Shows', Count: showCount },
      { Collection: 'Bookings', Count: bookingCount },
      { Collection: 'Payments', Count: paymentCount },
      { Collection: 'Feedbacks', Count: feedbackCount },
    ]);

    console.log('\n--- SAMPLE MOVIES ---');
    const movies = await Movie.find().select('title genres status imdbRating backdropUrl').limit(5);
    console.table(
      movies.map((m) => ({
        Title: m.title,
        Genres: m.genres.join(', '),
        Status: m.status,
        IMDb: m.imdbRating,
        Backdrop: m.backdropUrl,
      }))
    );

    console.log('\n--- USERS ---');
    const users = await User.find().select('name email role preferredCity');
    console.table(
      users.map((u) => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        City: u.preferredCity,
      }))
    );

    console.log('\n--- RECENT BOOKINGS ---');
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('movieId', 'title')
      .limit(5);

    console.table(
      bookings.map((b) => ({
        BookingId: b.bookingId,
        Movie: b.movieId?.title || 'N/A',
        User: b.userId?.name || 'N/A',
        Seats: Array.isArray(b.seats) ? b.seats.map((s) => s.seatNumber || s).join(', ') : 'N/A',
        Amount: `₹${b.totalAmount}`,
        Status: b.bookingStatus,
      }))
    );

    console.log('\nDatabase check complete.');
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
