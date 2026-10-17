import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import {
  Film,
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  Clock,
  Calendar,
  Check,
  AlertCircle,
} from 'lucide-react';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [duration, setDuration] = useState(120);
  const [languages, setLanguages] = useState('English, Hindi');
  const [genres, setGenres] = useState('Action, Adventure');
  const [certificate, setCertificate] = useState('UA');
  const [formats, setFormats] = useState('2D, 3D, IMAX');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [director, setDirector] = useState('');
  const [imdbRating, setImdbRating] = useState(8.0);
  const [status, setStatus] = useState('now_showing');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);

  const { showToast } = useToast();

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/movies');
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error('Failed to load movies:', err);
      showToast('Error loading movies catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setTitle('');
    setSynopsis('');
    setDuration(120);
    setLanguages('English, Hindi');
    setGenres('Action, Adventure');
    setCertificate('UA');
    setFormats('2D, 3D, IMAX');
    setTrailerUrl('');
    setPosterUrl('https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg');
    setBackdropUrl('https://image.tmdb.org/t/p/original/xDMIl84Qo5Tsu62c9DGWhmPI6Mc.jpg');
    setDirector('');
    setImdbRating(8.0);
    setStatus('now_showing');
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMovie(m);
    setTitle(m.title);
    setSynopsis(m.synopsis);
    setDuration(m.duration || 120);
    setLanguages(m.languages?.join(', ') || 'English');
    setGenres(m.genres?.join(', ') || 'Action');
    setCertificate(m.certificate || 'UA');
    setFormats(m.formats?.join(', ') || '2D, IMAX');
    setTrailerUrl(m.trailerUrl || '');
    setPosterUrl(m.posterUrl || '');
    setBackdropUrl(m.backdropUrl || '');
    setDirector(m.director || '');
    setImdbRating(m.imdbRating || 8.0);
    setStatus(m.status || 'now_showing');
    setReleaseDate(m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title,
        synopsis,
        duration: Number(duration),
        languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
        genres: genres.split(',').map((g) => g.trim()).filter(Boolean),
        certificate,
        formats: formats.split(',').map((f) => f.trim()).filter(Boolean),
        trailerUrl,
        posterUrl,
        backdropUrl,
        director,
        imdbRating: Number(imdbRating),
        status,
        releaseDate,
      };

      if (editingMovie) {
        await axios.put(`/api/movies/${editingMovie._id}`, payload);
        showToast('Movie details updated successfully.', 'success');
      } else {
        await axios.post('/api/movies', payload);
        showToast('New movie added to CineBook catalog.', 'success');
      }

      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save movie.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (mId, mTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${mTitle}" from the catalog?`)) {
      return;
    }

    try {
      await axios.delete(`/api/movies/${mId}`);
      showToast(`"${mTitle}" has been deleted.`, 'success');
      fetchMovies();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

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
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            Movie Catalog Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Add, update posters, YouTube trailers, certifications and scheduling status.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Add New Movie
        </button>
      </div>

      {/* Movies Table */}
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
                <th style={{ padding: '1rem' }}>POSTER & TITLE</th>
                <th style={{ padding: '1rem' }}>GENRES</th>
                <th style={{ padding: '1rem' }}>DURATION</th>
                <th style={{ padding: '1rem' }}>RATING</th>
                <th style={{ padding: '1rem' }}>FORMATS</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id} style={{ borderBottom: '1px solid #1A1A24' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      style={{ width: '42px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{m.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Cert: {m.certificate} • {m.languages?.join(', ')}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                    {m.genres?.join(', ')}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>
                    {m.duration} mins
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#F5C518' }}>
                      <Star size={13} fill="#F5C518" /> {m.imdbRating}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {m.formats?.slice(0, 2).map((f) => (
                        <span key={f} className="format-chip">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background:
                          m.status === 'now_showing'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(59, 130, 246, 0.15)',
                        color: m.status === 'now_showing' ? '#10B981' : '#3B82F6',
                      }}
                    >
                      {m.status === 'now_showing' ? 'NOW SHOWING' : 'COMING SOON'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(m)}
                        className="btn btn-secondary btn-sm"
                        title="Edit movie"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id, m.title)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete movie"
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

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '680px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                {editingMovie ? 'Edit Movie Details' : 'Add New Movie Title'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn" style={{ position: 'static' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Movie Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Synopsis / Plot Summary</label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Certificate</label>
                  <select
                    value={certificate}
                    onChange={(e) => setCertificate(e.target.value)}
                    className="form-select"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="A">A (Adults Only)</option>
                    <option value="PG13">PG-13</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Catalog Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Genres (comma separated)</label>
                  <input
                    type="text"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    className="form-input"
                    placeholder="Action, Sci-Fi, Adventure"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Languages (comma separated)</label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="form-input"
                    placeholder="English, Hindi, Tamil"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Formats (comma separated)</label>
                  <input
                    type="text"
                    value={formats}
                    onChange={(e) => setFormats(e.target.value)}
                    className="form-input"
                    placeholder="2D, 3D, IMAX, 4DX"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Director</label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Christopher Nolan"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">YouTube Trailer URL</label>
                <input
                  type="text"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Poster Image URL</label>
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Backdrop Artwork URL</label>
                  <input
                    type="text"
                    value={backdropUrl}
                    onChange={(e) => setBackdropUrl(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
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
                  {submitting ? 'Saving...' : editingMovie ? 'Update Movie' : 'Save Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;
