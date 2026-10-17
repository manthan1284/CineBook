const testSuite = async () => {
  const BASE_URL = 'http://localhost:5000/api';
  const CLIENT_URL = 'http://localhost:5173';

  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ ${name} - ${details}`);
      failed++;
    }
  };

  console.log('\n--- 1. SERVER HEALTH & STATIC ASSETS ---');
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'online', 'Server health API is online');

    const clientRes = await fetch(CLIENT_URL);
    assert(clientRes.status === 200, 'Client frontend dev server responds HTTP 200');

    // Test all backdrops and posters
    const assets = [
      '/images/wakanda-hero.jpg',
      '/images/dune-hero.jpg',
      '/images/oppenheimer-hero.jpg',
      '/images/kalki-hero.jpg',
      '/images/spiderman-hero.jpg',
      '/images/kalki-poster.jpg',
    ];
    for (const asset of assets) {
      const res = await fetch(`${CLIENT_URL}${asset}`);
      assert(res.status === 200, `Asset ${asset} served HTTP 200`);
    }
  } catch (err) {
    assert(false, 'Static asset verification', err.message);
  }

  console.log('\n--- 2. AUTHENTICATION & ROLE DETECTION ---');
  let adminToken = '';
  let userToken = '';
  try {
    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@cinebook.com', password: 'admin123' }),
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.user.role === 'admin', 'Admin login succeeds and role is "admin"');
    adminToken = adminData.token;

    // User login
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'arjun.sharma@gmail.com', password: 'user123' }),
    });
    const userData = await userLoginRes.json();
    assert(userLoginRes.status === 200 && userData.user.role === 'user', 'User login succeeds and role is "user"');
    userToken = userData.token;

    // Bad password
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@cinebook.com', password: 'wrongpassword' }),
    });
    assert(badLoginRes.status === 401, 'Bad credentials correctly rejected with 401');

    // Profile verification
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();
    assert(meData.user.email === 'admin@cinebook.com', 'JWT verification /auth/me returns current user');
  } catch (err) {
    assert(false, 'Authentication test failed', err.message);
  }

  console.log('\n--- 3. MOVIES CATALOG & FILTERS ---');
  let sampleMovie = null;
  try {
    const featuredRes = await fetch(`${BASE_URL}/movies/featured`);
    const featuredData = await featuredRes.json();
    assert(Array.isArray(featuredData.movies) && featuredData.movies.length > 0, 'Featured movies API returns list');
    assert(
      featuredData.movies[0].title.includes('Wakanda'),
      'First featured movie is Black Panther: Wakanda Forever'
    );

    const allMoviesRes = await fetch(`${BASE_URL}/movies`);
    const allMoviesData = await allMoviesRes.json();
    assert(allMoviesData.movies.length >= 8, `Catalog returns all seeded movies (found ${allMoviesData.movies.length})`);
    
    // Pick a now_showing movie that has scheduled shows in multiplexes
    sampleMovie = allMoviesData.movies.find((m) => m.status === 'now_showing') || allMoviesData.movies[0];

    // Filter test
    const actionFilterRes = await fetch(`${BASE_URL}/movies?genre=Action`);
    const actionFilterData = await actionFilterRes.json();
    assert(
      actionFilterData.movies.every((m) => m.genres.some((g) => g.toLowerCase().includes('action'))),
      'Genre filter works accurately for Action movies'
    );

    // Slug detail test
    const movieDetailRes = await fetch(`${BASE_URL}/movies/${sampleMovie.slug}`);
    const movieDetailData = await movieDetailRes.json();
    assert(movieDetailData.movie.title === sampleMovie.title, 'Movie details lookup by slug succeeds');
  } catch (err) {
    assert(false, 'Movies catalog test', err.message);
  }

  console.log('\n--- 4. THEATRES, SCREENS & SHOWS ---');
  let sampleShow = null;
  try {
    const theatresRes = await fetch(`${BASE_URL}/theatres?city=Mumbai`);
    const theatresData = await theatresRes.json();
    assert(theatresData.theatres.length >= 3, `Mumbai theatres found: ${theatresData.theatres.length}`);

    const showsRes = await fetch(`${BASE_URL}/shows?movieId=${sampleMovie._id}&city=Mumbai`);
    const showsData = await showsRes.json();
    assert(showsData.shows.length > 0, `Shows scheduled for movie in Mumbai: ${showsData.shows.length}`);
    sampleShow = showsData.shows[0];

    // Show seat layout
    const showDetailRes = await fetch(`${BASE_URL}/shows/${sampleShow._id}`);
    const showDetailData = await showDetailRes.json();
    assert(
      showDetailData.show && showDetailData.show.screenId.totalSeats > 0,
      `Show details return full screen seat layout (${showDetailData.show?.screenId?.totalSeats} seats)`
    );
  } catch (err) {
    assert(false, 'Theatres & Shows test', err.message);
  }

  console.log('\n--- 5. SEAT LOCKING & BOOKING LIFECYCLE ---');
  let createdBooking = null;
  try {
    // Generate dynamic unbooked seat labels to test fresh checkout
    const rand = Math.floor(Math.random() * 800) + 10;
    const s1 = `TEST_${rand}_A`;
    const s2 = `TEST_${rand}_B`;

    // 1. Lock seats
    const lockRes = await fetch(`${BASE_URL}/bookings/lock-seats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        showId: sampleShow._id,
        seatNumbers: [s1, s2],
      }),
    });
    const lockData = await lockRes.json();
    assert(lockRes.status === 200, `Seats ${s1} and ${s2} locked successfully with 8-min TTL`);

    // 2. Create Booking
    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        showId: sampleShow._id,
        seats: [
          { row: 'J', col: 1, seatNumber: s1, category: 'Silver', price: 220 },
          { row: 'J', col: 2, seatNumber: s2, category: 'Silver', price: 220 },
        ],
        fnbItems: [{ id: 'popcorn-lrg', name: 'Jumbo Butter Popcorn', price: 320, quantity: 1 }],
        paymentMethod: 'UPI',
        paymentDetails: { upiId: 'arjun@okaxis' },
      }),
    });
    const bookingData = await bookingRes.json();
    assert(bookingRes.status === 201 && bookingData.booking?.bookingId, `Booking created successfully: ${bookingData.booking?.bookingId}`);
    createdBooking = bookingData.booking;

    // 3. Double-booking prevention check: Trying to lock s1 again must fail
    const conflictRes = await fetch(`${BASE_URL}/bookings/lock-seats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        showId: sampleShow._id,
        seatNumbers: [s1],
      }),
    });
    assert(conflictRes.status === 400, 'Double-booking race condition prevention verified (seat already confirmed)');

    // Verify booking in My Bookings
    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const myBookingsData = await myBookingsRes.json();
    assert(
      myBookingsData.bookings.some((b) => b.bookingId === createdBooking.bookingId),
      'New booking appears immediately in user My Bookings history'
    );
  } catch (err) {
    assert(false, 'Booking flow test', err.message);
  }

  console.log('\n--- 6. ADMIN DASHBOARD & PRIVILEGED APIS ---');
  try {
    // Admin dashboard KPI
    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = await dashRes.json();
    assert(dashData.stats && typeof dashData.stats.totalRevenue === 'number', 'Admin dashboard KPI metrics calculated');

    // Admin user management
    const usersRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    assert(usersData.users.length >= 3, `Admin users list returned (${usersData.users.length} users)`);

    // Privilege check: normal user cannot access admin APIs
    const forbiddenRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(forbiddenRes.status === 403, 'Normal user strictly rejected (403 Forbidden) from admin dashboard');
  } catch (err) {
    assert(false, 'Admin APIs test', err.message);
  }

  console.log('\n=======================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('=======================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

testSuite();
