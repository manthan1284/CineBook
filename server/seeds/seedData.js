const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cinebook');
    console.log('MongoDB connected for seeding...');
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};

const seed = async () => {
  try {
    await connectDB();

    console.log('Clearing existing CineBook data...');
    await User.deleteMany();
    await Movie.deleteMany();
    await Theatre.deleteMany();
    await Screen.deleteMany();
    await Show.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Feedback.deleteMany();

    console.log('Seeding Users...');

    const adminUser = await User.create({
      name: 'Aditya Verma (Admin)',
      email: 'admin@cinebook.com',
      password: 'admin123',
      phone: '+91 98200 12345',
      role: 'admin',
      preferredCity: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    const user1 = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun.sharma@gmail.com',
      password: 'user123',
      phone: '+91 98111 23456',
      role: 'user',
      preferredCity: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      password: 'user123',
      phone: '+91 97222 34567',
      role: 'user',
      preferredCity: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    });

    console.log('Seeding Movies...');
    const moviesData = [
      {
        title: 'Black Panther: Wakanda Forever',
        slug: 'black-panther-wakanda-forever',
        synopsis: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T'Challa's death. As the Wakandans strive to embrace their next chapter, the heroes must band together with Nakia and Everett Ross to forge a new path for their beloved kingdom.",
        duration: 161,
        languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
        genres: ['Action', 'Adventure', 'Fantasy'],
        certificate: 'PG13',
        formats: ['2D', '3D', '4D', 'IMAX'],
        trailerUrl: 'https://www.youtube.com/watch?v=_Z3QKfv30tU',
        posterUrl: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
        backdropUrl: '/images/wakanda-hero.jpg',
        imdbRating: 8.0,
        likesPercentage: 90,
        director: 'Ryan Coogler',
        cast: [
          { name: 'Letitia Wright', role: 'Shuri / Black Panther', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
          { name: 'Angela Bassett', role: 'Queen Ramonda', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
          { name: 'Tenoch Huerta', role: 'Namor', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
          { name: "Lupita Nyong'o", role: 'Nakia', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2024-11-11'),
        status: 'now_showing',
        isFeatured: true,
        isTrending: true,
      },
      {
        title: 'Oppenheimer',
        slug: 'oppenheimer',
        synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral weight and devastating geopolitical fallout of the Manhattan Project.',
        duration: 180,
        languages: ['English', 'Hindi'],
        genres: ['Biography', 'Drama', 'History'],
        certificate: 'A',
        formats: ['IMAX 70mm', 'IMAX', '2D'],
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        backdropUrl: '/images/oppenheimer-hero.jpg',
        imdbRating: 8.9,
        likesPercentage: 94,
        director: 'Christopher Nolan',
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
          { name: 'Emily Blunt', role: 'Kitty Oppenheimer', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2024-07-21'),
        status: 'now_showing',
        isFeatured: true,
        isTrending: true,
      },
      {
        title: 'Dune: Part Two',
        slug: 'dune-part-two',
        synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
        duration: 166,
        languages: ['English', 'Hindi'],
        genres: ['Sci-Fi', 'Adventure', 'Action'],
        certificate: 'UA',
        formats: ['IMAX', '4DX', '3D', '2D'],
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdropUrl: '/images/dune-hero.jpg',
        imdbRating: 8.6,
        likesPercentage: 92,
        director: 'Denis Villeneuve',
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' },
          { name: 'Zendaya', role: 'Chani', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2024-03-01'),
        status: 'now_showing',
        isFeatured: true,
        isTrending: true,
      },
      {
        title: 'Kalki 2898 AD',
        slug: 'kalki-2898-ad',
        synopsis: 'Set in a post-apocalyptic world in the year 2898 AD, a modern-day avatar of Vishnu descends to earth to protect the world from evil forces in a clash between dystopian tech and ancient Indian mythology.',
        duration: 181,
        languages: ['Telugu', 'Hindi', 'Tamil', 'English'],
        genres: ['Sci-Fi', 'Action', 'Mythology'],
        certificate: 'UA',
        formats: ['3D', 'IMAX', '2D'],
        trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
        posterUrl: '/images/kalki-poster.jpg',
        backdropUrl: '/images/kalki-hero.jpg',
        imdbRating: 7.9,
        likesPercentage: 88,
        director: 'Nag Ashwin',
        cast: [
          { name: 'Prabhas', role: 'Bhairava', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
          { name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
          { name: 'Deepika Padukone', role: 'SUM-80', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2024-06-27'),
        status: 'now_showing',
        isFeatured: true,
        isTrending: true,
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        slug: 'spider-man-across-the-spider-verse',
        synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        duration: 140,
        languages: ['English', 'Hindi', 'Tamil'],
        genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
        certificate: 'U',
        formats: ['2D', '3D', 'IMAX'],
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdropUrl: '/images/spiderman-hero.jpg',
        imdbRating: 8.7,
        likesPercentage: 96,
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales (voice)', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2024-06-02'),
        status: 'now_showing',
        isFeatured: false,
        isTrending: true,
      },
      {
        title: 'Interstellar: 10th Anniversary',
        slug: 'interstellar-10th-anniversary',
        synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        duration: 169,
        languages: ['English'],
        genres: ['Sci-Fi', 'Drama', 'Adventure'],
        certificate: 'UA',
        formats: ['IMAX 70mm', 'IMAX Laser', '2D'],
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/rAiYTsqJJR0KP8UN8vCnZ9v9Ko0.jpg',
        imdbRating: 8.7,
        likesPercentage: 97,
        director: 'Christopher Nolan',
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
          { name: 'Anne Hathaway', role: 'Brand', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2024-09-15'),
        status: 'now_showing',
        isFeatured: false,
        isTrending: true,
      },
      {
        title: 'Deadpool & Wolverine',
        slug: 'deadpool-and-wolverine',
        synopsis: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
        duration: 128,
        languages: ['English', 'Hindi'],
        genres: ['Action', 'Comedy', 'Sci-Fi'],
        certificate: 'A',
        formats: ['2D', '3D', 'IMAX', '4DX'],
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB128ioCW.jpg',
        imdbRating: 7.8,
        likesPercentage: 86,
        director: 'Shawn Levy',
        cast: [
          { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
          { name: 'Hugh Jackman', role: 'Logan / Wolverine', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2024-07-26'),
        status: 'now_showing',
        isFeatured: false,
        isTrending: false,
      },
      {
        title: 'Avatar: Fire and Ash',
        slug: 'avatar-fire-and-ash',
        synopsis: 'The saga continues as Jake Sully and Neytiri encounter the Ash People, a volcanic clan of Na\'vi with distinct cultural rituals and motives that threaten Pandora\'s fragile balance.',
        duration: 195,
        languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
        genres: ['Sci-Fi', 'Action', 'Adventure'],
        certificate: 'UA',
        formats: ['IMAX 3D', '3D', '4DX'],
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZIMQvRjrqqw.jpg',
        imdbRating: 8.5,
        likesPercentage: 93,
        director: 'James Cameron',
        cast: [
          { name: 'Sam Worthington', role: 'Jake Sully', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
          { name: 'Zoe Saldana', role: 'Neytiri', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2025-12-19'),
        status: 'coming_soon',
        isFeatured: false,
        isTrending: false,
      },
      {
        title: 'The Batman Part II',
        slug: 'the-batman-part-ii',
        synopsis: 'Bruce Wayne delves further into Gotham\'s criminal underworld while a new, insidious criminal mastermind challenges his detective skills and morality.',
        duration: 175,
        languages: ['English', 'Hindi'],
        genres: ['Action', 'Crime', 'Drama'],
        certificate: 'UA',
        formats: ['IMAX', '2D'],
        trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
        posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/original/tRS6jvPM9qPrrnx2KRx3ew96Yot.jpg',
        imdbRating: 8.4,
        likesPercentage: 91,
        director: 'Matt Reeves',
        cast: [
          { name: 'Robert Pattinson', role: 'Bruce Wayne / Batman', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
        ],
        releaseDate: new Date('2026-10-02'),
        status: 'coming_soon',
        isFeatured: false,
        isTrending: false,
      },
    ];

    const createdMovies = await Movie.insertMany(moviesData);

    console.log('Seeding Theatres...');
    const theatresData = [
      {
        name: 'PVR ICON: Phoenix Palladium',
        city: 'Mumbai',
        address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
        locationMapUrl: 'https://maps.google.com/?q=PVR+ICON+Phoenix+Palladium+Mumbai',
        amenities: ['Dolby Atmos', 'IMAX with Laser', 'Gourmet Food Court', 'Valet Parking', 'Recliner Lounges'],
        isActive: true,
      },
      {
        name: 'Cinepolis: Nexus Seawoods Mall',
        city: 'Mumbai',
        address: 'Sector 40, Seawoods Railway Station, Navi Mumbai, Maharashtra 400706',
        locationMapUrl: 'https://maps.google.com/?q=Cinepolis+Nexus+Seawoods',
        amenities: ['4DX Motion Cinema', 'Dolby 7.1', 'VIP Recliner Service', 'Kids Play Zone'],
        isActive: true,
      },
      {
        name: 'INOX: Megaplex Inorbit Mall',
        city: 'Mumbai',
        address: 'Link Road, Malad West, Mumbai, Maharashtra 400064',
        locationMapUrl: 'https://maps.google.com/?q=INOX+Megaplex+Malad',
        amenities: ['IMAX', 'ScreenX 270-degree', 'Insignia Dining', 'Wheelchair Access'],
        isActive: true,
      },
      {
        name: 'PVR Director’s Cut: Ambience Mall',
        city: 'Delhi-NCR',
        address: 'Nelson Mandela Marg, Vasant Kunj II, New Delhi, Delhi 110070',
        locationMapUrl: 'https://maps.google.com/?q=PVR+Directors+Cut+Ambience+Mall+Delhi',
        amenities: ['Luxury Recliner Seats', 'Chef Crafted Sushi Bar', 'Dolby Atmos', 'Concierge Service'],
        isActive: true,
      },
      {
        name: 'PVR Superplex: Forum South Bengaluru',
        city: 'Bengaluru',
        address: 'Kanakapura Main Rd, Yalachenahalli, Bengaluru, Karnataka 560062',
        locationMapUrl: 'https://maps.google.com/?q=PVR+Forum+South+Bengaluru',
        amenities: ['IMAX with Laser', '4DX', 'Gold Class Lounge', 'Multi-cuisine Bistro'],
        isActive: true,
      },
      {
        name: 'Prasads Multiplex',
        city: 'Hyderabad',
        address: 'NTR Gardens, Khairatabad, Hyderabad, Telangana 500063',
        locationMapUrl: 'https://maps.google.com/?q=Prasads+Multiplex+Hyderabad',
        amenities: ['India’s Giant IMAX Screen', '4K Dual Projection', 'Gaming Arena', 'Food Plaza'],
        isActive: true,
      },
    ];

    const createdTheatres = await Theatre.insertMany(theatresData);

    console.log('Seeding Screens...');
    const screens = [];
    const defaultLayout = {
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      cols: 16,
      aisleIndices: [4, 12],
      tiers: [
        { name: 'Platinum', rows: ['A', 'B'], basePrice: 450 },
        { name: 'Gold', rows: ['C', 'D', 'E', 'F'], basePrice: 280 },
        { name: 'Silver', rows: ['G', 'H', 'I', 'J'], basePrice: 180 },
      ],
    };

    for (const theatre of createdTheatres) {
      const s1 = await Screen.create({
        theatreId: theatre._id,
        name: 'Screen 1 - IMAX Laser',
        screenType: 'IMAX Laser',
        totalSeats: 160,
        layoutConfig: defaultLayout,
        isActive: true,
      });

      const s2 = await Screen.create({
        theatreId: theatre._id,
        name: 'Screen 2 - Dolby Atmos',
        screenType: 'Dolby Atmos',
        totalSeats: 160,
        layoutConfig: defaultLayout,
        isActive: true,
      });

      const s3 = await Screen.create({
        theatreId: theatre._id,
        name: 'Screen 3 - Gold Class',
        screenType: 'Gold Class',
        totalSeats: 160,
        layoutConfig: defaultLayout,
        isActive: true,
      });

      screens.push({ theatre, screens: [s1, s2, s3] });
    }

    console.log('Seeding Shows for next 6 days...');
    const nowShowingMovies = createdMovies.filter((m) => m.status === 'now_showing');
    const showsList = [];

    // Dates: today + next 5 days
    const dateStrings = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dateStrings.push(d.toISOString().split('T')[0]);
    }

    const showSlots = [
      { start: '10:30 AM', end: '01:15 PM' },
      { start: '01:45 PM', end: '04:30 PM' },
      { start: '05:00 PM', end: '07:45 PM' },
      { start: '08:15 PM', end: '11:00 PM' },
    ];

    for (const dateStr of dateStrings) {
      for (const tItem of screens) {
        // Screen 1: Top Movie (Wakanda Forever or Oppenheimer or Dune)
        const movieForS1 = nowShowingMovies[0]; // Black Panther
        for (const slot of showSlots) {
          showsList.push({
            movieId: movieForS1._id,
            theatreId: tItem.theatre._id,
            screenId: tItem.screens[0]._id,
            showDate: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            format: 'IMAX 3D',
            language: 'English',
            pricing: { platinum: 480, gold: 320, silver: 220 },
            blockedSeats: ['A1', 'A2'], // sample VIP holds
          });
        }

        // Screen 2: Oppenheimer or Dune 2
        const movieForS2 = nowShowingMovies[1]; // Oppenheimer
        for (const slot of showSlots) {
          showsList.push({
            movieId: movieForS2._id,
            theatreId: tItem.theatre._id,
            screenId: tItem.screens[1]._id,
            showDate: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            format: 'Dolby Atmos',
            language: 'English',
            pricing: { platinum: 450, gold: 280, silver: 180 },
            blockedSeats: [],
          });
        }

        // Screen 3: Kalki 2898 AD / Spider-Man
        const movieForS3 = nowShowingMovies[3]; // Kalki
        for (const slot of showSlots) {
          showsList.push({
            movieId: movieForS3._id,
            theatreId: tItem.theatre._id,
            screenId: tItem.screens[2]._id,
            showDate: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            format: '3D',
            language: 'Hindi',
            pricing: { platinum: 420, gold: 260, silver: 160 },
            blockedSeats: [],
          });
        }
      }
    }

    const createdShows = await Show.insertMany(showsList);
    console.log(`Created ${createdShows.length} shows!`);

    console.log('Seeding Sample Bookings & Payments for Analytics...');
    // Seed some confirmed past and future bookings for Arjun Sharma and Priya Patel
    const sampleShow = createdShows[0];
    const sampleShow2 = createdShows[4];
    const sampleShow3 = createdShows[12];

    const booking1 = await Booking.create({
      bookingId: 'CNB-849201',
      userId: user1._id,
      showId: sampleShow._id,
      movieId: sampleShow.movieId,
      theatreId: sampleShow.theatreId,
      screenId: sampleShow.screenId,
      showDate: sampleShow.showDate,
      showTime: sampleShow.startTime,
      seats: [
        { seatNumber: 'C7', row: 'C', col: 7, category: 'Gold', price: 320 },
        { seatNumber: 'C8', row: 'C', col: 8, category: 'Gold', price: 320 },
      ],
      fnbItems: [
        { name: 'Caramel Large Popcorn Tub', price: 350, quantity: 1 },
        { name: 'Pepsi Chill (500ml)', price: 180, quantity: 2 },
      ],
      subtotal: 1350,
      convenienceFee: 71,
      discount: 100,
      totalAmount: 1321,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      paymentId: 'PAY-782103',
      paymentMethod: 'UPI',
      qrCodeData: JSON.stringify({
        bookingId: 'CNB-849201',
        movie: 'Black Panther: Wakanda Forever',
        theatre: 'PVR ICON: Phoenix Palladium',
        date: sampleShow.showDate,
        time: sampleShow.startTime,
        seats: ['C7', 'C8'],
        amount: 1321,
      }),
    });

    await Payment.create({
      paymentId: 'PAY-782103',
      bookingId: booking1._id,
      userId: user1._id,
      amount: 1321,
      currency: 'INR',
      method: 'UPI',
      status: 'success',
      transactionRef: 'TXN-982189381',
    });

    const booking2 = await Booking.create({
      bookingId: 'CNB-512930',
      userId: user2._id,
      showId: sampleShow2._id,
      movieId: sampleShow2.movieId,
      theatreId: sampleShow2.theatreId,
      screenId: sampleShow2.screenId,
      showDate: sampleShow2.showDate,
      showTime: sampleShow2.startTime,
      seats: [
        { seatNumber: 'E5', row: 'E', col: 5, category: 'Gold', price: 280 },
        { seatNumber: 'E6', row: 'E', col: 6, category: 'Gold', price: 280 },
      ],
      subtotal: 560,
      convenienceFee: 71,
      discount: 0,
      totalAmount: 631,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      paymentId: 'PAY-904128',
      paymentMethod: 'Card',
      qrCodeData: JSON.stringify({
        bookingId: 'CNB-512930',
        movie: 'Oppenheimer',
        theatre: 'PVR Superplex: Forum South Bengaluru',
        date: sampleShow2.showDate,
        time: sampleShow2.startTime,
        seats: ['E5', 'E6'],
        amount: 631,
      }),
    });

    await Payment.create({
      paymentId: 'PAY-904128',
      bookingId: booking2._id,
      userId: user2._id,
      amount: 631,
      currency: 'INR',
      method: 'Card',
      status: 'success',
      transactionRef: 'TXN-661298412',
    });

    // Sample cancelled booking
    const booking3 = await Booking.create({
      bookingId: 'CNB-331049',
      userId: user1._id,
      showId: sampleShow3._id,
      movieId: sampleShow3.movieId,
      theatreId: sampleShow3.theatreId,
      screenId: sampleShow3.screenId,
      showDate: sampleShow3.showDate,
      showTime: sampleShow3.startTime,
      seats: [
        { seatNumber: 'H10', row: 'H', col: 10, category: 'Silver', price: 180 },
      ],
      subtotal: 180,
      convenienceFee: 35,
      discount: 0,
      totalAmount: 215,
      paymentStatus: 'refunded',
      bookingStatus: 'cancelled',
      paymentId: 'PAY-112948',
      paymentMethod: 'UPI',
      refundAmount: 161,
      refundStatus: 'processed',
      cancelledAt: new Date(),
      qrCodeData: JSON.stringify({
        bookingId: 'CNB-331049',
        cancelled: true,
      }),
    });

    console.log('Seeding Feedback Reviews...');
    await Feedback.create([
      {
        userId: user1._id,
        movieId: createdMovies[0]._id, // Wakanda Forever
        rating: 5,
        comment: 'Mindblowing visuals and emotional score! Angela Bassett and Letitia Wright gave absolute powerhouse performances. The IMAX experience at Palladium was phenomenal.',
        isApproved: true,
      },
      {
        userId: user2._id,
        movieId: createdMovies[0]._id,
        rating: 4,
        comment: 'Namor and Talokan worldbuilding was stunning. Great action choreography and respectful tribute to Chadwick Boseman.',
        isApproved: true,
      },
      {
        userId: user1._id,
        movieId: createdMovies[1]._id, // Oppenheimer
        rating: 5,
        comment: 'A cinematic tour de force. Christopher Nolan’s sound design literally shook the auditorium seats during the Trinity test. Cillian Murphy deserves every award.',
        isApproved: true,
      },
      {
        userId: user2._id,
        movieId: createdMovies[2]._id, // Dune 2
        rating: 5,
        comment: 'Pure cinematic poetry on a grand scale. The worm-riding sequence in IMAX gave goosebumps. Hans Zimmer’s score is unmatched.',
        isApproved: true,
      },
    ]);

    console.log('=============================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Admin login: admin@cinebook.com / admin123');
    console.log('User login:  arjun.sharma@gmail.com / user123');
    console.log('=============================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
