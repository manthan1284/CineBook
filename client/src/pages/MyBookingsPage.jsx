import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  Calendar,
  Clock,
  Building2,
  AlertTriangle,
  X,
  Download,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [activeTicketModal, setActiveTicketModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { showToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/bookings/my-bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    try {
      const res = await axios.post(`/api/bookings/${selectedBookingForCancel._id}/cancel`);
      showToast(res.data.message, 'success');
      setSelectedBookingForCancel(null);
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancellation failed.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
          My Bookings & Tickets
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          View active admission passes, show details, QR codes, and refund status.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2].map((n) => (
            <div key={n} style={{ height: '180px', background: '#14141F', borderRadius: '12px' }} />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookings.map((booking) => {
            const isConfirmed = booking.bookingStatus === 'confirmed';
            return (
              <div
                key={booking._id}
                style={{
                  background: '#13131C',
                  border: isConfirmed ? '1px solid #222232' : '1px solid #331515',
                  borderRadius: '14px',
                  padding: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
              >
                {/* Poster & Details */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '75px',
                      aspectRatio: '2/3',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#1E1E2C',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={booking.movieId?.posterUrl}
                      alt="Poster"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: isConfirmed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isConfirmed ? '#10B981' : '#EF4444',
                        }}
                      >
                        {isConfirmed ? 'CONFIRMED' : 'CANCELLED'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        ID: {booking.bookingId}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
                      {booking.movieId?.title}
                    </h3>

                    <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {booking.theatreId?.name} • {booking.screenId?.name}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '0.82rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '0.5rem',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {booking.showDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {booking.showTime}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#fff' }}>
                      Seats:{' '}
                      <strong style={{ color: 'var(--color-primary)' }}>
                        {booking.seats?.map((s) => s.seatNumber).join(', ')}
                      </strong>{' '}
                      • Paid ₹{booking.totalAmount}
                    </div>

                    {booking.refundAmount > 0 && (
                      <div style={{ fontSize: '0.82rem', color: '#10B981', marginTop: '4px' }}>
                        Refund of ₹{booking.refundAmount} processed to {booking.paymentMethod}.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveTicketModal(booking)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Ticket size={16} /> View E-Ticket
                  </button>

                  {isConfirmed && (
                    <button
                      onClick={() => setSelectedBookingForCancel(booking)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', background: '#101016', borderRadius: '14px' }}>
          <Ticket size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>No movie bookings yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            Book your tickets for currently playing blockbusters now!
          </p>
        </div>
      )}

      {/* Cancellation Modal */}
      {selectedBookingForCancel && (
        <div className="modal-overlay" onClick={() => setSelectedBookingForCancel(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', padding: '1.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#EF4444', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                Cancel Booking?
              </h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Are you sure you want to cancel your ticket for{' '}
              <strong style={{ color: '#fff' }}>{selectedBookingForCancel.movieId?.title}</strong> on{' '}
              <strong>{selectedBookingForCancel.showDate}</strong>?
            </p>

            <div
              style={{
                background: '#151520',
                border: '1px solid #222232',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>Refund Policy:</div>
              <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                <li>&gt; 24h before show: 75% refund of ticket total</li>
                <li>2h - 24h before show: 50% refund of ticket total</li>
                <li>&lt; 2h before show: Non-refundable</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedBookingForCancel(null)}
                className="btn btn-secondary"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="btn btn-primary"
                style={{ background: '#EF4444', borderColor: '#EF4444' }}
              >
                {cancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {activeTicketModal && (
        <div className="modal-overlay" onClick={() => setActiveTicketModal(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '540px', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: 'var(--color-primary)',
                padding: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>CINEBOOK DIGITAL PASS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{activeTicketModal.bookingId}</div>
              </div>
              <button
                onClick={() => setActiveTicketModal(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                {activeTicketModal.movieId?.title}
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {activeTicketModal.theatreId?.name} • {activeTicketModal.screenId?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {activeTicketModal.showDate} at {activeTicketModal.showTime}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#0B0B0E',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #20202E',
                  marginTop: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SEATS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                    {activeTicketModal.seats?.map((s) => s.seatNumber).join(', ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>Total: ₹{activeTicketModal.totalAmount}</div>
                </div>

                <div style={{ background: '#fff', padding: '6px', borderRadius: '6px' }}>
                  <QRCodeSVG value={activeTicketModal.qrCodeData || activeTicketModal.bookingId} size={84} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
