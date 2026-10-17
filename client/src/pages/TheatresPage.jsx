import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCity } from '../context/CityContext';
import { Building2, MapPin, Sparkles, Navigation, MonitorPlay, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const TheatresPage = () => {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/theatres?city=${encodeURIComponent(selectedCity)}`);
        setTheatres(res.data.theatres || []);
      } catch (err) {
        console.error('Error fetching theatres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity]);

  const filtered = theatres.filter((th) =>
    th.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    th.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Title & City Header */}
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
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
            Theatres & Multiplexes
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Cinemas in <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{selectedCity}</span>
          </p>
        </div>

        <button
          onClick={() => setIsCityModalOpen(true)}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          <MapPin size={16} color="var(--color-primary)" />
          Change City ({selectedCity})
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '2.5rem' }}>
        <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Search by cinema name or neighbourhood..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '38px' }}
        />
      </div>

      {/* Theatres List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ height: '160px', background: '#14141F', borderRadius: '12px' }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filtered.map((theatre) => (
            <div
              key={theatre._id}
              style={{
                background: '#13131B',
                border: '1px solid #20202E',
                borderRadius: '14px',
                padding: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#20202E')}
            >
              <div style={{ flex: '1 1 350px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <Building2 size={20} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {theatre.name}
                  </h3>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '1rem',
                  }}
                >
                  <MapPin size={15} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                  <span>{theatre.address}</span>
                </div>

                {/* Amenities Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span
                    style={{
                      background: 'rgba(229, 9, 20, 0.12)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(229, 9, 20, 0.3)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MonitorPlay size={12} /> {theatre.screensCount || 3} Screens
                  </span>

                  {theatre.amenities?.map((amenity) => (
                    <span
                      key={amenity}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #222230',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {theatre.locationMapUrl && (
                  <a
                    href={theatre.locationMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Open in Google Maps"
                  >
                    <Navigation size={14} /> Map
                  </a>
                )}

                <Link
                  to={`/movies`}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.4rem' }}
                >
                  Select Shows
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#101016', borderRadius: '12px' }}>
          <Building2 size={42} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>No theatres found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            There are no multiplexes registered in {selectedCity} matching your search.
          </p>
          <button onClick={() => setIsCityModalOpen(true)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
            Switch City
          </button>
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
