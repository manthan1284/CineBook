import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { useCity } from '../../context/CityContext';
import {
  Building2,
  Plus,
  MonitorPlay,
  Pencil,
  Trash2,
  X,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTheatreId, setExpandedTheatreId] = useState(null);
  const [screensMap, setScreensMap] = useState({});

  // Add Theatre Modal
  const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false);
  const [theatreName, setTheatreName] = useState('');
  const [theatreCity, setTheatreCity] = useState('Mumbai');
  const [theatreAddress, setTheatreAddress] = useState('');
  const [theatreAmenities, setTheatreAmenities] = useState('Dolby Atmos, IMAX with Laser, Food Court, Parking');

  // Add Screen Modal
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [targetTheatreId, setTargetTheatreId] = useState(null);
  const [screenName, setScreenName] = useState('Screen 1 - IMAX');
  const [screenType, setScreenType] = useState('IMAX Laser');
  const [screenTotalSeats, setScreenTotalSeats] = useState(160);

  const { cities } = useCity();
  const { showToast } = useToast();

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/theatres');
      setTheatres(res.data.theatres || []);
    } catch (err) {
      console.error('Failed to load theatres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const toggleExpandTheatre = async (theatreId) => {
    if (expandedTheatreId === theatreId) {
      setExpandedTheatreId(null);
      return;
    }

    setExpandedTheatreId(theatreId);
    if (!screensMap[theatreId]) {
      try {
        const res = await axios.get(`/api/theatres/${theatreId}/screens`);
        setScreensMap((prev) => ({ ...prev, [theatreId]: res.data.screens || [] }));
      } catch (err) {
        showToast('Error loading screens for this theatre.', 'error');
      }
    }
  };

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/theatres', {
        name: theatreName,
        city: theatreCity,
        address: theatreAddress,
        amenities: theatreAmenities,
      });

      showToast('New theatre created successfully!', 'success');
      setIsTheatreModalOpen(false);
      setTheatreName('');
      setTheatreAddress('');
      fetchTheatres();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create theatre.', 'error');
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/theatres/screens', {
        theatreId: targetTheatreId,
        name: screenName,
        screenType,
        totalSeats: Number(screenTotalSeats),
      });

      showToast('Auditorium screen added successfully!', 'success');
      setIsScreenModalOpen(false);

      // Refresh screens for this theatre
      const res = await axios.get(`/api/theatres/${targetTheatreId}/screens`);
      setScreensMap((prev) => ({ ...prev, [targetTheatreId]: res.data.screens || [] }));
      fetchTheatres();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add screen.', 'error');
    }
  };

  const handleDeleteTheatre = async (tId, tName) => {
    if (!window.confirm(`Are you sure you want to delete ${tName}? All associated screens will be removed.`)) {
      return;
    }
    try {
      await axios.delete(`/api/theatres/${tId}`);
      showToast('Theatre deleted successfully.', 'success');
      fetchTheatres();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
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
            Theatres & Screens Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage cinema properties, city locations, and configure auditorium layouts with rows A-J.
          </p>
        </div>

        <button onClick={() => setIsTheatreModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Add New Theatre
        </button>
      </div>

      {/* Theatres List with expandable screens */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {theatres.map((th) => {
          const isExpanded = expandedTheatreId === th._id;
          const screens = screensMap[th._id] || [];

          return (
            <div
              key={th._id}
              style={{
                background: '#13131C',
                border: '1px solid #20202E',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Theatre Row */}
              <div
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => toggleExpandTheatre(th._id)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={18} color="var(--color-primary)" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                      {th.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                      }}
                    >
                      {th.city}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {th.address}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                    {th.screensCount || 0} Screens
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetTheatreId(th._id);
                      setIsScreenModalOpen(true);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={14} /> Add Screen
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTheatre(th._id, th.name);
                    }}
                    className="btn btn-outline-danger btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div style={{ color: 'var(--color-text-muted)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Expanded Screens View */}
              {isExpanded && (
                <div
                  style={{
                    background: '#0D0D14',
                    borderTop: '1px solid #1E1E2C',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    AUDITORIUM SCREENS AT {th.name?.toUpperCase()}
                  </div>

                  {screens.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                      {screens.map((sc) => (
                        <div
                          key={sc._id}
                          style={{
                            background: '#161622',
                            border: '1px solid #28283C',
                            borderRadius: '8px',
                            padding: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                              {sc.name}
                            </div>
                            <span className="format-chip">{sc.screenType}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            Total Capacity: <strong>{sc.totalSeats} Seats</strong> (Rows A-J)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '2px' }}>
                            Tiers: Platinum (Rows A-B), Gold (C-F), Silver (G-J)
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      No screens created yet for this multiplex. Click "+ Add Screen" above to configure.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Theatre Modal */}
      {isTheatreModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTheatreModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '560px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                Add New Theatre Property
              </h2>
              <button onClick={() => setIsTheatreModalOpen(false)} className="modal-close-btn" style={{ position: 'static' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTheatre}>
              <div className="form-group">
                <label className="form-label">Theatre Name</label>
                <input
                  type="text"
                  placeholder="e.g. PVR ICON: Oberoi Mall"
                  value={theatreName}
                  onChange={(e) => setTheatreName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City Location</label>
                <select
                  value={theatreCity}
                  onChange={(e) => setTheatreCity(e.target.value)}
                  className="form-select"
                >
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Full Address</label>
                <textarea
                  rows={2}
                  placeholder="Street, Landmark, City, Pincode"
                  value={theatreAddress}
                  onChange={(e) => setTheatreAddress(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma separated)</label>
                <input
                  type="text"
                  value={theatreAmenities}
                  onChange={(e) => setTheatreAmenities(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsTheatreModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Theatre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {isScreenModalOpen && (
        <div className="modal-overlay" onClick={() => setIsScreenModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '520px', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                Add Screen & Seat Layout
              </h2>
              <button onClick={() => setIsScreenModalOpen(false)} className="modal-close-btn" style={{ position: 'static' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateScreen}>
              <div className="form-group">
                <label className="form-label">Screen Title / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Screen 1 - IMAX Laser"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Projection & Audio Type</label>
                <select
                  value={screenType}
                  onChange={(e) => setScreenType(e.target.value)}
                  className="form-select"
                >
                  <option value="IMAX Laser">IMAX Laser</option>
                  <option value="Dolby Atmos">Dolby Atmos</option>
                  <option value="4DX">4DX Motion</option>
                  <option value="Gold Class">Gold Class Luxury</option>
                  <option value="Standard">Standard 2D/3D</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Auditorium Seat Capacity</label>
                <input
                  type="number"
                  value={screenTotalSeats}
                  onChange={(e) => setScreenTotalSeats(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div
                style={{
                  background: '#0E0E14',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #20202E',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '1.5rem',
                }}
              >
                <strong>Seat Layout Config:</strong> Automatically generates Rows A to J (160 seats), with Platinum recliners (Rows A-B), Gold tier (Rows C-F), and Silver tier (Rows G-J).
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsScreenModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatresPage;
