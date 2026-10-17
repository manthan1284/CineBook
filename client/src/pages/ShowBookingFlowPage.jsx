import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { useToast } from '../context/ToastContext';
import SeatLayout from '../components/SeatLayout';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Film,
  Building2,
  Ticket,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Timer,
  ChevronRight,
  Download,
  Percent,
  Plus,
  Minus,
  Smartphone,
  ShieldCheck,
  Share2,
} from 'lucide-react';

const FNB_ITEMS = [
  { id: 'popcorn-caramel', name: 'Caramel Popcorn Jumbo Tub', price: 350, desc: 'Freshly popped with rich caramelized brown sugar' },
  { id: 'nachos-cheese', name: 'Cheese Nachos with Salsa Dip', price: 260, desc: 'Crispy corn tortilla chips with warm cheese sauce' },
  { id: 'coke-chill', name: 'Chilled Coca-Cola Zero (500ml)', price: 160, desc: 'Ice-cold refreshing beverage with no sugar' },
  { id: 'slider-combo', name: 'Gourmet Sliders & Fries Combo', price: 380, desc: 'Two brioche sliders with seasoned crinkle-cut fries' },
];

const ShowBookingFlowPage = () => {
  const { id } = useParams(); // movie id or slug
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { selectedCity } = useCity();
  const { showToast } = useToast();

  // Wizard state: 1: 'shows', 2: 'seats', 3: 'fnb', 4: 'payment', 5: 'ticket'
  const [currentStep, setCurrentStep] = useState(1);

  // Movie & Shows data
  const [movie, setMovie] = useState(null);
  const [allShows, setAllShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [loading, setLoading] = useState(true);

  // Seat selection & lock state
  const [seatStatus, setSeatStatus] = useState({ booked: [], locked: [], myLocked: [], blocked: [] });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [lockTimerSeconds, setLockTimerSeconds] = useState(480); // 8 minutes default

  // F&B state
  const [fnbCart, setFnbCart] = useState({});

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // Payment Form state
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Confirmed Booking Output
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const ticketRef = useRef(null);

  // Generate next 6 dates
  const availableDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return { dateStr, dayName, dayNumber };
  });

  // Fetch Movie and all shows for this movie in the selected city
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const movieRes = await axios.get(`/api/movies/${id}`);
        setMovie(movieRes.data.movie);

        const showsRes = await axios.get(`/api/shows?movieId=${movieRes.data.movie._id}&city=${encodeURIComponent(selectedCity)}`);
        setAllShows(showsRes.data.shows || []);
      } catch (err) {
        console.error('Error loading booking data:', err);
        showToast('Unable to load showtimes for this movie.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, selectedCity]);

  // Fetch real-time seat availability when a show is selected
  const fetchShowSeats = async (showId) => {
    try {
      const res = await axios.get(`/api/shows/${showId}`);
      setSelectedShow(res.data.show);
      setSeatStatus(res.data.seatStatus);
    } catch (err) {
      showToast('Error loading live seat status.', 'error');
    }
  };

  // Lock timer countdown
  useEffect(() => {
    if (!lockExpiresAt || currentStep !== 2) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(lockExpiresAt).getTime() - new Date().getTime();
      const secs = Math.max(0, Math.floor(remainingMs / 1000));
      setLockTimerSeconds(secs);

      if (secs <= 0) {
        clearInterval(interval);
        showToast('Seat reservation hold expired. Please reselect your seats.', 'warning');
        setSelectedSeats([]);
        setLockExpiresAt(null);
        if (selectedShow) fetchShowSeats(selectedShow._id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, currentStep, selectedShow]);

  // Handle seat click
  const handleToggleSeat = (seatObj) => {
    const exists = selectedSeats.some((s) => s.seatNumber === seatObj.seatNumber);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seatObj.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        showToast('Maximum 8 seats allowed per booking.', 'warning');
        return;
      }
      setSelectedSeats([...selectedSeats, seatObj]);
    }
  };

  // Proceed from Step 1 (Showtime) -> Step 2 (Seats)
  const handleSelectShowSlot = (show) => {
    fetchShowSeats(show._id);
    setSelectedSeats([]);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Proceed from Step 2 (Seats) -> Step 3 (F&B): Lock seats in backend!
  const handleProceedToConcessions = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in or use one-click demo login to reserve seats.', 'warning');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      showToast('Please select at least 1 seat to proceed.', 'error');
      return;
    }

    try {
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);
      const res = await axios.post('/api/bookings/lock-seats', {
        showId: selectedShow._id,
        seatNumbers,
      });

      setLockExpiresAt(res.data.expiresAt);
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Seats temporarily reserved for your checkout.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to hold selected seats.';
      showToast(msg, 'error');
      fetchShowSeats(selectedShow._id);
    }
  };

  // F&B Quantity changes
  const updateFnbQty = (itemId, change) => {
    setFnbCart((prev) => {
      const current = prev[itemId] || 0;
      const nextVal = Math.max(0, current + change);
      if (nextVal === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: nextVal };
    });
  };

  // Calculate pricing
  const ticketSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const fnbSubtotal = Object.entries(fnbCart).reduce((sum, [itemId, qty]) => {
    const item = FNB_ITEMS.find((f) => f.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const baseTotal = ticketSubtotal + fnbSubtotal;
  const convenienceFee = selectedSeats.length > 0 ? Math.round(selectedSeats.length * 30 * 1.18) : 0;

  // Apply promo discount
  let discountAmount = 0;
  if (appliedPromo === 'CINEFIRST') {
    discountAmount = Math.min(150, Math.round(baseTotal * 0.15));
  } else if (appliedPromo === 'BLOCKBUSTER' && baseTotal >= 500) {
    discountAmount = 100;
  } else if (appliedPromo === 'WEEKEND20') {
    discountAmount = Math.min(250, Math.round(baseTotal * 0.2));
  }

  const grandTotal = Math.max(0, baseTotal + convenienceFee - discountAmount);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (['CINEFIRST', 'BLOCKBUSTER', 'WEEKEND20'].includes(code)) {
      setAppliedPromo(code);
      showToast(`Promo code "${code}" applied successfully!`, 'success');
    } else {
      showToast('Invalid promo code. Try CINEFIRST or BLOCKBUSTER.', 'error');
    }
  };

  // Quick autofill test payment
  const fillTestPayment = (method) => {
    setPaymentMethod(method);
    if (method === 'Card') {
      setCardNumber('4532 •••• •••• 8892');
      setCardExpiry('12/28');
      setCardCvv('789');
    } else if (method === 'UPI') {
      setUpiId('arjun.sharma@okaxis');
    }
    showToast(`Test ${method} details auto-filled!`, 'info');
  };

  // Confirm booking & finalize payment
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const fnbPayload = Object.entries(fnbCart).map(([itemId, qty]) => {
        const item = FNB_ITEMS.find((f) => f.id === itemId);
        return {
          name: item.name,
          price: item.price,
          quantity: qty,
        };
      });

      const res = await axios.post('/api/bookings', {
        showId: selectedShow._id,
        seats: selectedSeats,
        fnbItems: fnbPayload,
        promoCode: appliedPromo,
        paymentMethod,
        paymentDetails: {
          simulated: true,
          method: paymentMethod,
          timestamp: new Date().toISOString(),
        },
      });

      setConfirmedBooking(res.data.booking);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast('Booking Confirmed! Your digital E-ticket is ready.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment processing failed.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Filter shows by date
  const filteredShowsByDate = allShows.filter((s) => s.showDate === selectedDate);

  // Group shows by Theatre
  const showsByTheatre = {};
  filteredShowsByDate.forEach((show) => {
    const tId = show.theatreId?._id;
    if (!tId) return;
    if (!showsByTheatre[tId]) {
      showsByTheatre[tId] = {
        theatre: show.theatreId,
        shows: [],
      };
    }
    showsByTheatre[tId].shows.push(show);
  });

  if (loading) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center', color: 'var(--color-primary)' }}>
        Loading cinema shows & live seats...
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Breadcrumb & Wizard Stepper Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #1E1E2C',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/movies">Movies</Link>
            <span>/</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{movie?.title}</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
            {movie?.title}
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {movie?.certificate} • {movie?.languages?.join(', ')} • {movie?.genres?.join(', ')}
          </div>
        </div>

        {/* Stepper tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[
            { step: 1, label: 'Showtime' },
            { step: 2, label: 'Seats' },
            { step: 3, label: 'Concessions' },
            { step: 4, label: 'Checkout' },
            { step: 5, label: 'E-Ticket' },
          ].map((s) => {
            const active = currentStep === s.step;
            const completed = currentStep > s.step;
            return (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: active
                      ? 'var(--color-primary)'
                      : completed
                      ? 'var(--color-success)'
                      : '#20202E',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {completed ? '✓' : s.step}
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#fff' : completed ? '#A0A0B0' : 'var(--color-text-muted)',
                  }}
                >
                  {s.label}
                </span>
                {s.step < 5 && <span style={{ color: '#2A2A3A', margin: '0 2px' }}>→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Select Date & Show Times */}
      {currentStep === 1 && (
        <div>
          {/* Date Picker Ribbon */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  style={{
                    background: isSelected ? 'var(--color-primary)' : '#13131B',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary)' : '#222230',
                    color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                    borderRadius: '10px',
                    padding: '0.75rem 1.25rem',
                    minWidth: '100px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.dayName}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '2px' }}>
                    {item.dayNumber}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Theatres list with Showtimes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(showsByTheatre).length > 0 ? (
              Object.values(showsByTheatre).map(({ theatre, shows }) => (
                <div
                  key={theatre._id}
                  style={{
                    background: '#13131C',
                    border: '1px solid #20202E',
                    borderRadius: '12px',
                    padding: '1.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                      borderBottom: '1px solid #1C1C28',
                      paddingBottom: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={18} color="var(--color-primary)" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                          {theatre.name}
                        </h3>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {theatre.address}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {theatre.amenities?.slice(0, 3).map((a) => (
                        <span key={a} className="format-chip">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {shows.map((show) => (
                      <button
                        key={show._id}
                        onClick={() => handleSelectShowSlot(show)}
                        style={{
                          background: '#1B1B26',
                          border: '1px solid #2A2A3C',
                          borderRadius: '8px',
                          padding: '0.65rem 1.1rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2A2A3C';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} color="var(--color-primary)" />
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                            {show.startTime}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {show.format} • {show.screenId?.name || 'Screen 1'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
                          ₹{show.pricing?.silver || 180} onwards
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#101016', borderRadius: '12px' }}>
                <Film size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>No shows scheduled on this date</h3>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                  Please pick another date from the calendar ribbon above.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Interactive Seat Selection */}
      {currentStep === 2 && selectedShow && (
        <div>
          {/* Header Bar with countdown timer */}
          <div
            style={{
              background: '#12121A',
              border: '1px solid #1E1E2C',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                {selectedShow.theatreId?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {selectedShow.screenId?.name} • {selectedShow.showDate} at {selectedShow.startTime} ({selectedShow.format})
              </div>
            </div>

            {/* Back button and Hold Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary btn-sm"
              >
                Change Showtime
              </button>

              {lockExpiresAt && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid #F59E0B',
                    color: '#F59E0B',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                  }}
                >
                  <Timer size={16} />
                  <span>
                    Hold: {Math.floor(lockTimerSeconds / 60)}:{('0' + (lockTimerSeconds % 60)).slice(-2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Seat Layout */}
          <div
            style={{
              background: '#0E0E14',
              border: '1px solid #1E1E2C',
              borderRadius: '16px',
              padding: '2rem 1rem',
              marginBottom: '2rem',
            }}
          >
            <SeatLayout
              screenConfig={selectedShow.screenId}
              pricing={selectedShow.pricing}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
              bookedSeats={seatStatus.booked}
              lockedSeats={seatStatus.locked}
              blockedSeats={seatStatus.blocked}
            />
          </div>

          {/* Sticky Bottom Action Bar */}
          <div
            style={{
              background: '#14141E',
              border: '1px solid #242436',
              borderRadius: '12px',
              padding: '1.25rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>SELECTED SEATS ({selectedSeats.length}/8):</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginTop: '2px' }}>
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((s) => s.seatNumber).join(', ')
                ) : (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                    Please click on available seats above
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>SUBTOTAL:</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
                  ₹{ticketSubtotal}
                </div>
              </div>

              <button
                onClick={handleProceedToConcessions}
                disabled={selectedSeats.length === 0}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.8rem', fontSize: '1rem' }}
              >
                Proceed to Checkout <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Concessions (F&B) */}
      {currentStep === 3 && (
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              Grab Popcorn & Gourmet Snacks
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
              Pre-order cinema concessions delivered straight to your seat or ready at the counter.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            {FNB_ITEMS.map((item) => {
              const qty = fnbCart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#13131C',
                    border: '1px solid #20202E',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F5C518', marginTop: '4px' }}>
                      ₹{item.price}
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {qty > 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'rgba(229, 9, 20, 0.15)',
                          border: '1px solid var(--color-primary)',
                          borderRadius: '8px',
                          padding: '0.2rem 0.6rem',
                        }}
                      >
                        <button
                          onClick={() => updateFnbQty(item.id, -1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '18px', textAlign: 'center' }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => updateFnbQty(item.id, 1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateFnbQty(item.id, 1)}
                        className="btn btn-secondary btn-sm"
                        style={{ borderRadius: '6px', fontWeight: 700 }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setCurrentStep(2)}
              className="btn btn-secondary"
            >
              Back to Seats
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Continue to Payment (₹{grandTotal}) <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Checkout & Payment */}
      {currentStep === 4 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Left Column: Payment Gateway Tabs */}
          <div
            style={{
              background: '#12121A',
              border: '1px solid #1E1E2C',
              borderRadius: '16px',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={22} color="var(--color-primary)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  Choose Payment Method
                </h2>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}
              >
                TEST MODE SAFE
              </span>
            </div>

            {/* Method Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
              {['UPI', 'Card', 'NetBanking'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    flex: 1,
                    background: paymentMethod === m ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid',
                    borderColor: paymentMethod === m ? 'var(--color-primary)' : '#262638',
                    color: paymentMethod === m ? '#fff' : 'var(--color-text-secondary)',
                    padding: '0.65rem 0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* UPI Details */}
            {paymentMethod === 'UPI' && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Virtual Payment Address (VPA / UPI ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@oksbi / 9820012345@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiId(`demo.${app.toLowerCase().replace(' ', '')}@okbank`)}
                      style={{
                        flex: 1,
                        background: '#1A1A26',
                        border: '1px solid #28283C',
                        color: '#ddd',
                        padding: '0.45rem 0',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {app}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => fillTestPayment('UPI')}
                  className="btn btn-secondary btn-sm"
                  style={{ marginBottom: '1.5rem', width: '100%' }}
                >
                  ⚡ Auto-fill Test UPI ID
                </button>
              </div>
            )}

            {/* Card Details */}
            {paymentMethod === 'Card' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8892"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label">Expiry MM/YY</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fillTestPayment('Card')}
                  className="btn btn-secondary btn-sm"
                  style={{ marginBottom: '1.5rem', width: '100%' }}
                >
                  ⚡ Auto-fill Test Card Details
                </button>
              </div>
            )}

            {/* NetBanking Details */}
            {paymentMethod === 'NetBanking' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select Your Bank</label>
                <select className="form-select">
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            <button
              onClick={handleConfirmPayment}
              disabled={isProcessingPayment}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1.1rem', fontWeight: 800 }}
            >
              {isProcessingPayment ? 'Authorizing Payment...' : `Pay ₹${grandTotal} Securely`}
            </button>
          </div>

          {/* Right Column: Sticky Booking Summary */}
          <div>
            <div
              style={{
                background: '#12121A',
                border: '1px solid #1E1E2C',
                borderRadius: '16px',
                padding: '1.75rem',
                position: 'sticky',
                top: '90px',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                Booking Summary
              </h3>

              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #20202E', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{movie?.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {selectedShow?.theatreId?.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {selectedShow?.showDate} • {selectedShow?.startTime} ({selectedShow?.format})
                </div>
                <div style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                  Seats: {selectedSeats.map((s) => s.seatNumber).join(', ')} ({selectedSeats.length} Tickets)
                </div>
              </div>

              {/* Promo code box */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter Promo (CINEFIRST)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 700 }}
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
                    ✓ Promo code {appliedPromo} applied!
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Tickets Subtotal</span>
                  <span>₹{ticketSubtotal}</span>
                </div>

                {fnbSubtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                    <span>F&B Concessions</span>
                    <span>₹{fnbSubtotal}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Convenience Fee (incl. GST)</span>
                  <span>₹{convenienceFee}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 700 }}>
                    <span>Promo Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#FFFFFF',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed #28283C',
                    marginTop: '0.5rem',
                  }}
                >
                  <span>Amount Payable</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: E-Ticket Presentation & PDF Download */}
      {currentStep === 5 && confirmedBooking && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                border: '2px solid #10B981',
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              Booking Confirmed!
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Your digital e-ticket has been issued. Show the QR code at the cinema entry turnstile.
            </p>
          </div>

          {/* Boarding Pass Style E-Ticket */}
          <div
            ref={ticketRef}
            style={{
              background: '#14141E',
              border: '1.5px solid #28283C',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              marginBottom: '2rem',
            }}
          >
            {/* Ticket Header */}
            <div
              style={{
                background: 'var(--color-primary)',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#fff',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                  CINEBOOK ADMIT PASS
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {confirmedBooking.bookingId}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>AUDITORIUM</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  {confirmedBooking.screenId?.name || 'Screen 1'}
                </div>
              </div>
            </div>

            {/* Ticket Content */}
            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '80px',
                    aspectRatio: '2/3',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: '#20202E',
                  }}
                >
                  <img
                    src={confirmedBooking.movieId?.posterUrl || movie?.posterUrl}
                    alt="Poster"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                    {confirmedBooking.movieId?.title || movie?.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {confirmedBooking.theatreId?.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {confirmedBooking.theatreId?.address}
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.85rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>DATE</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                        {confirmedBooking.showDate}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>TIME</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                        {confirmedBooking.showTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seats and QR Code row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  background: '#0B0B0E',
                  borderRadius: '12px',
                  border: '1px solid #20202C',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CONFIRMED SEATS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                    {confirmedBooking.seats?.map((s) => s.seatNumber).join(', ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
                    Total Paid: ₹{confirmedBooking.totalAmount}
                  </div>
                </div>

                {/* QR Code */}
                <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <QRCodeSVG
                    value={confirmedBooking.qrCodeData || confirmedBooking.bookingId}
                    size={88}
                    level="H"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Footer Tear-off strip */}
            <div
              style={{
                background: '#101017',
                borderTop: '1px dashed #2A2A3C',
                padding: '0.85rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <span>Guest: {user?.name || 'Valued Guest'}</span>
              <span>Ref: {confirmedBooking.paymentId}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              <Download size={16} /> Print / Save Ticket
            </button>

            <Link
              to="/my-bookings"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              View in My Bookings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowBookingFlowPage;
