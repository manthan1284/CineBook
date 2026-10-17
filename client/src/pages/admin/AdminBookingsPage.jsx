import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import {
  Ticket,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Eye,
  X,
  CreditCard,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { showToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/admin/bookings?status=${statusFilter}&search=${encodeURIComponent(search)}&page=${page}&limit=12`
      );
      setBookings(res.data.bookings || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Error loading bookings ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, search, page]);

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            Bookings Ledger & Cancellations
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Audit all reservation transactions, seat allocations, and processed refund amounts.
          </p>
        </div>

        <a
          href="/api/admin/export/bookings"
          download
          className="btn btn-primary btn-sm"
        >
          <Download size={14} /> Export All as CSV
        </a>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#12121A',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #1E1E2C',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Booking ID (CNB-...) or date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
            />
          </div>
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'confirmed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              style={{
                background: statusFilter === st ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: statusFilter === st ? 'var(--color-primary)' : '#242436',
                color: statusFilter === st ? '#fff' : 'var(--color-text-secondary)',
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div
        style={{
          background: '#13131C',
          border: '1px solid #20202E',
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0F0F15', borderBottom: '1px solid #20202E', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '1rem' }}>BOOKING ID</th>
                <th style={{ padding: '1rem' }}>CUSTOMER</th>
                <th style={{ padding: '1rem' }}>MOVIE & THEATRE</th>
                <th style={{ padding: '1rem' }}>SHOW DATE & TIME</th>
                <th style={{ padding: '1rem' }}>SEATS</th>
                <th style={{ padding: '1rem' }}>AMOUNT</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid #1A1A24' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {b.bookingId}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{b.userId?.name || 'Guest'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{b.userId?.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{b.movieId?.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {b.theatreId?.name} ({b.screenId?.name})
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                    <div>{b.showDate}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)' }}>{b.showTime}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {b.seats?.map((s) => s.seatNumber).join(', ')}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#fff' }}>
                    ₹{b.totalAmount}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background:
                          b.bookingStatus === 'confirmed'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(239, 68, 68, 0.15)',
                        color: b.bookingStatus === 'confirmed' ? '#10B981' : '#EF4444',
                      }}
                    >
                      {b.bookingStatus?.toUpperCase()}
                    </span>
                    {b.refundAmount > 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>
                        Refund: ₹{b.refundAmount}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="btn btn-secondary btn-sm"
                      title="Inspect full ticket details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                background: page === p ? 'var(--color-primary)' : '#14141E',
                border: '1px solid #242436',
                color: '#fff',
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
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
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#fff',
              }}
            >
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Booking Details - {selectedBooking.bookingId}
              </h2>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>PATRON:</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                  {selectedBooking.userId?.name} ({selectedBooking.userId?.email})
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>CINEMA & MOVIE:</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>
                  {selectedBooking.movieId?.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {selectedBooking.theatreId?.name} • {selectedBooking.showDate} at {selectedBooking.showTime}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ALLOCATED SEATS:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {selectedBooking.seats?.map((s) => `${s.seatNumber} (${s.category} - ₹${s.price})`).join(', ')}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0B0B0E', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>TOTAL PAID</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                    ₹{selectedBooking.totalAmount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Ref: {selectedBooking.paymentId}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '6px', borderRadius: '6px' }}>
                  <QRCodeSVG value={selectedBooking.qrCodeData || selectedBooking.bookingId} size={70} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
