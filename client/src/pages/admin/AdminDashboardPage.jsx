import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  IndianRupee,
  Ticket,
  Film,
  Users,
  TrendingUp,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-primary)' }}>
        Aggregating multiplex analytics and sales metrics...
      </div>
    );
  }

  const { stats, chartData, recentBookings } = data || {
    stats: {},
    chartData: { dailyRevenue: [], topMovies: [] },
    recentBookings: [],
  };

  // Find max daily revenue for chart scaling
  const maxRevenue = Math.max(...(chartData?.dailyRevenue?.map((d) => d.revenue) || [1000]), 1000);

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            Executive Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Platform revenue, ticket volume, active auditorium screens and daily box office trends.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href="/api/admin/export/bookings"
            download
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} /> Export Bookings CSV
          </a>
          <a
            href="/api/admin/export/revenue"
            download
            className="btn btn-primary btn-sm"
          >
            <Download size={14} /> Export Financials CSV
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Total Revenue */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>TOTAL GROSS REVENUE</span>
            <div style={{ padding: '6px', background: 'rgba(229, 9, 20, 0.15)', borderRadius: '6px', color: 'var(--color-primary)' }}>
              <IndianRupee size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.75rem' }}>
            ₹{stats.totalRevenue?.toLocaleString('en-IN') || '0'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
            Today: ₹{stats.todayRevenue?.toLocaleString('en-IN') || '0'}
          </div>
        </div>

        {/* Total Bookings */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>TOTAL CONFIRMED TICKETS</span>
            <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '6px', color: '#10B981' }}>
              <Ticket size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.75rem' }}>
            {stats.confirmedBookings || stats.totalBookings || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Cancelled: {stats.cancelledBookings || 0}
          </div>
        </div>

        {/* Active Shows */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>ACTIVE SHOWS SCHEDULED</span>
            <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '6px', color: '#3B82F6' }}>
              <Film size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.75rem' }}>
            {stats.totalShows || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Across {stats.totalTheatres || 6} Cinemas
          </div>
        </div>

        {/* Total Users */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '12px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 700 }}>
            <span>REGISTERED PATRONS</span>
            <div style={{ padding: '6px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '6px', color: '#F59E0B' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.75rem' }}>
            {stats.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '4px' }}>
            Verified Accounts
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Daily Revenue Bar Chart */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '14px',
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Daily Revenue Trend
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Gross ticket collections for the last 7 days
              </div>
            </div>
            <TrendingUp size={18} color="var(--color-primary)" />
          </div>

          {/* SVG / CSS Bar Chart */}
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '0.85rem', paddingBottom: '1.5rem' }}>
            {chartData?.dailyRevenue?.map((item) => {
              const heightPercent = maxRevenue > 0 ? Math.max(10, Math.round((item.revenue / maxRevenue) * 100)) : 10;
              return (
                <div
                  key={item.date}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
                    {item.revenue > 0 ? `₹${item.revenue}` : ''}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '38px',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, var(--color-primary) 0%, #8A040C 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                    title={`${item.label}: ₹${item.revenue} (${item.bookings} bookings)`}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    {item.label?.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Grossing Movies */}
        <div
          style={{
            background: '#13131C',
            border: '1px solid #20202E',
            borderRadius: '14px',
            padding: '1.75rem',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            Top Grossing Movies
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Highest grossing catalog titles
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chartData?.topMovies?.length > 0 ? (
              chartData.topMovies.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    style={{ width: '38px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{m.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {m.ticketsSold || 0} tickets sold ({m.bookingsCount || 0} orders)
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                    ₹{m.totalRevenue?.toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                No movie revenue logs recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div
        style={{
          background: '#13131C',
          border: '1px solid #20202E',
          borderRadius: '14px',
          padding: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              Live Bookings Feed
            </h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Recent ticket reservations processed across cinemas
            </div>
          </div>
          <Link to="/admin/bookings" className="btn btn-secondary btn-sm">
            View All Bookings
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #20202E', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>BOOKING ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>PATRON</th>
                <th style={{ padding: '0.75rem 1rem' }}>MOVIE</th>
                <th style={{ padding: '0.75rem 1rem' }}>THEATRE</th>
                <th style={{ padding: '0.75rem 1rem' }}>DATE & TIME</th>
                <th style={{ padding: '0.75rem 1rem' }}>SEATS</th>
                <th style={{ padding: '0.75rem 1rem' }}>AMOUNT</th>
                <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings?.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid #1A1A24' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>
                    {b.bookingId}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)' }}>
                    {b.userId?.name || 'Guest'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {b.movieId?.title}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-secondary)' }}>
                    {b.theatreId?.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)' }}>
                    {b.showDate} {b.showTime}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {b.seats?.map((s) => s.seatNumber).join(', ')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    ₹{b.totalAmount}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        padding: '2px 8px',
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
