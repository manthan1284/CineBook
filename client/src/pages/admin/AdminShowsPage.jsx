import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import {
  CalendarClock,
  Plus,
  Trash2,
  X,
  Clock,
  Film,
  Building2,
  Armchair,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Show Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [showDate, setShowDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:30 AM');
  const [endTime, setEndTime] = useState('01:15 PM');
  const [format, setFormat] = useState('IMAX 3D');
  const [language, setLanguage] = useState('English');
  const [platinumPrice, setPlatinumPrice] = useState(480);
  const [goldPrice, setGoldPrice] = useState(320);
  const [silverPrice, setSilverPrice] = useState(220);
  const [submitting, setSubmitting] = useState(false);

  // Seat Block Modal
  const [activeShowForSeats, setActiveShowForSeats] = useState(null);
  const [blockSeatInput, setBlockSeatInput] = useState('');

  const { showToast } = useToast();

  const fetchShows = async () => {
    setLoading(true);
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        axios.get('/api/shows'),
        axios.get('/api/movies?status=now_showing'),
        axios.get('/api/theatres'),
      ]);
      setShows(showsRes.data.shows || []);
      setMovies(moviesRes.data.movies || []);
      setTheatres(theatresRes.data.theatres || []);

      if (moviesRes.data.movies?.length > 0) {
        setSelectedMovieId(moviesRes.data.movies[0]._id);
      }
      if (theatresRes.data.theatres?.length > 0) {
        setSelectedTheatreId(theatresRes.data.theatres[0]._id);
        fetchScreensForTheatre(theatresRes.data.theatres[0]._id);
      }
    } catch (err) {
      console.error('Failed to load shows data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScreensForTheatre = async (tId) => {
    try {
      const res = await axios.get(`/api/theatres/${tId}/screens`);
      setScreens(res.data.screens || []);
      if (res.data.screens?.length > 0) {
        setSelectedScreenId(res.data.screens[0]._id);
      }
    } catch (err) {
      console.error('Error fetching screens:', err);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleTheatreChange = (tId) => {
    setSelectedTheatreId(tId);
    fetchScreensForTheatre(tId);
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/shows', {
        movieId: selectedMovieId,
        theatreId: selectedTheatreId,
        screenId: selectedScreenId,
        showDate,
        startTime,
        endTime,
        format,
        language,
        pricing: {
          platinum: Number(platinumPrice),
          gold: Number(goldPrice),
          silver: Number(silverPrice),
        },
      });

      showToast('Show scheduled successfully without timing conflicts!', 'success');
      setIsModalOpen(false);
      fetchShows();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create show. Please check timing overlaps.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShow = async (sId) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) return;
    try {
      await axios.delete(`/api/shows/${sId}`);
      showToast('Show removed from schedule.', 'success');
      fetchShows();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const handleToggleBlockSeat = async (seatNum) => {
    if (!activeShowForSeats || !seatNum) return;
    try {
      const res = await axios.post(`/api/shows/${activeShowForSeats._id}/toggle-block-seat`, {
        seatNumber: seatNum.toUpperCase(),
      });
      showToast(res.data.message, 'info');
      setActiveShowForSeats((prev) => ({
        ...prev,
        blockedSeats: res.data.blockedSeats,
      }));
      setBlockSeatInput('');
      fetchShows();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

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
            Show Scheduling & Seat Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Schedule auditorium screenings with automated collision/overlap detection and seat locking.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Schedule New Show
        </button>
      </div>

      {/* Shows Table */}
      <div
        style={{
          background: '#13131C',
          border: '1px solid #20202E',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0F0F15', borderBottom: '1px solid #20202E', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '1rem' }}>MOVIE</th>
                <th style={{ padding: '1rem' }}>THEATRE & SCREEN</th>
                <th style={{ padding: '1rem' }}>DATE & TIME</th>
                <th style={{ padding: '1rem' }}>FORMAT</th>
                <th style={{ padding: '1rem' }}>PRICING TIERS</th>
                <th style={{ padding: '1rem' }}>BLOCKED SEATS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {shows.slice(0, 50).map((show) => (
                <tr key={show._id} style={{ borderBottom: '1px solid #1A1A24' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {show.movieId?.title}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                    <div>{show.theatreId?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {show.screenId?.name} ({show.theatreId?.city})
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#fff' }}>
                    <div style={{ fontWeight: 600 }}>{show.showDate}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                      {show.startTime} - {show.endTime}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="format-chip">{show.format}</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.82rem' }}>
                    <div>Platinum: ₹{show.pricing?.platinum || 450}</div>
                    <div>Gold: ₹{show.pricing?.gold || 280}</div>
                    <div>Silver: ₹{show.pricing?.silver || 180}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {show.blockedSeats && show.blockedSeats.length > 0 ? (
                      <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.82rem' }}>
                        {show.blockedSeats.join(', ')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setActiveShowForSeats(show)}
                        className="btn btn-secondary btn-sm"
                        title="Block or Unblock Seats"
                      >
                        <Armchair size={14} /> Manage Seats
                      </button>

                      <button
                        onClick={() => handleDeleteShow(show._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Show"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Show Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarClock size={22} color="var(--color-primary)" />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                  Schedule Auditorium Show
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn" style={{ position: 'static' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateShow}>
              <div className="form-group">
                <label className="form-label">Select Movie</label>
                <select
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="form-select"
                  required
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.duration} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Theatre</label>
                  <select
                    value={selectedTheatreId}
                    onChange={(e) => handleTheatreChange(e.target.value)}
                    className="form-select"
                    required
                  >
                    {theatres.map((th) => (
                      <option key={th._id} value={th._id}>
                        {th.name} ({th.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Screen</label>
                  <select
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {screens.map((sc) => (
                      <option key={sc._id} value={sc._id}>
                        {sc.name} ({sc.screenType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Show Date</label>
                  <input
                    type="date"
                    value={showDate}
                    onChange={(e) => setShowDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="text"
                    placeholder="01:15 PM"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Screen Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="form-select"
                  >
                    <option value="IMAX 3D">IMAX 3D</option>
                    <option value="IMAX Laser">IMAX Laser</option>
                    <option value="4DX">4DX Motion</option>
                    <option value="3D">3D RealD</option>
                    <option value="2D">2D Standard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Platinum Price (₹)</label>
                  <input
                    type="number"
                    value={platinumPrice}
                    onChange={(e) => setPlatinumPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gold Price (₹)</label>
                  <input
                    type="number"
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Silver Price (₹)</label>
                  <input
                    type="number"
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(229, 9, 20, 0.08)',
                  border: '1px solid rgba(229, 9, 20, 0.3)',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#fff',
                  marginBottom: '1.5rem',
                }}
              >
                ⚠️ <strong>Conflict Prevention:</strong> CineBook will automatically ensure no overlapping show runs in this auditorium on this date.
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Checking Conflicts...' : 'Schedule Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Block / Unblock Modal */}
      {activeShowForSeats && (
        <div className="modal-overlay" onClick={() => setActiveShowForSeats(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '540px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  Manage Seat Blocks
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {activeShowForSeats.movieId?.title} • {activeShowForSeats.startTime}
                </div>
              </div>
              <button onClick={() => setActiveShowForSeats(null)} className="modal-close-btn" style={{ position: 'static' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Temporarily reserve seats for VIP guests, equipment placement, or auditorium maintenance.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Seat number (e.g. A1, A2, B5)"
                value={blockSeatInput}
                onChange={(e) => setBlockSeatInput(e.target.value.toUpperCase())}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => handleToggleBlockSeat(blockSeatInput)}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                Toggle Block
              </button>
            </div>

            {/* Currently Blocked list */}
            <div style={{ background: '#0D0D14', border: '1px solid #1E1E2C', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                CURRENTLY BLOCKED SEATS:
              </div>
              {activeShowForSeats.blockedSeats && activeShowForSeats.blockedSeats.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {activeShowForSeats.blockedSeats.map((seat) => (
                    <button
                      key={seat}
                      onClick={() => handleToggleBlockSeat(seat)}
                      style={{
                        background: '#331010',
                        border: '1px solid #772020',
                        color: '#EF4444',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Click to unblock"
                    >
                      {seat} ✕
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                  No seats are currently blocked for this show.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;
