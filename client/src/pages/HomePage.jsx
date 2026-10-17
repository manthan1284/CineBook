import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCity } from '../context/CityContext';
import HeroSlider from '../components/HeroSlider';
import MovieCard from '../components/MovieCard';
import { Film, Calendar, Clapperboard, Sparkles, Filter, ChevronRight, Award, Volume2, Armchair } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const { selectedCity, setIsCityModalOpen } = useCity();

  const genres = ['All', 'Action', 'Adventure', 'Sci-Fi', 'Drama', 'Animation', 'Comedy'];
  const formats = ['All', 'IMAX', '3D', '4DX', '2D'];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featuredRes, nowRes, comingRes] = await Promise.all([
          axios.get('/api/movies/featured'),
          axios.get('/api/movies?status=now_showing'),
          axios.get('/api/movies?status=coming_soon'),
        ]);

        setFeaturedMovies(featuredRes.data.movies || []);
        setNowShowing(nowRes.data.movies || []);
        setComingSoon(comingRes.data.movies || []);
      } catch (err) {
        console.error('Failed to load movies data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Filter now showing
  const filteredNowShowing = nowShowing.filter((m) => {
    const matchesGenre =
      selectedGenre === 'All' ||
      m.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
    const matchesFormat =
      selectedFormat === 'All' ||
      m.formats?.some((f) => f.toUpperCase().includes(selectedFormat.toUpperCase()));
    return matchesGenre && matchesFormat;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Showcase Slider matching reference image */}
      <HeroSlider movies={featuredMovies} />

      {/* Quick Filter Bar */}
      <section
        style={{
          background: '#0F0F15',
          borderBottom: '1px solid #1C1C28',
          padding: '1rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Genre filter buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} /> FILTER:
            </span>
            {genres.map((g) => {
              const active = selectedGenre === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  style={{
                    background: active ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#fff' : 'var(--color-text-secondary)',
                    border: '1px solid',
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border-subtle)',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Format Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>FORMAT:</span>
            {formats.map((f) => {
              const active = selectedFormat === f;
              return (
                <button
                  key={f}
                  onClick={() => setSelectedFormat(f)}
                  style={{
                    background: active ? '#FFFFFF' : 'transparent',
                    color: active ? '#0B0B0E' : 'var(--color-text-secondary)',
                    border: '1px solid',
                    borderColor: active ? '#fff' : 'var(--color-border-subtle)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge-new">IN CINEMAS</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>Now Showing</h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Multiplex shows available in <span style={{ color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setIsCityModalOpen(true)}>{selectedCity}</span>
            </p>
          </div>

          <Link
            to="/movies?status=now_showing"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            View All ({nowShowing.length}) <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ height: '380px', background: '#161622', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : filteredNowShowing.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {filteredNowShowing.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#12121A', borderRadius: '12px' }}>
            <Film size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No movies found matching current filter criteria.</div>
            <button
              onClick={() => {
                setSelectedGenre('All');
                setSelectedFormat('All');
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1rem' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Experience Showcase Banner */}
      <section className="container" style={{ marginTop: '4.5rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #181822 0%, #0E0E14 100%)',
            border: '1px solid #242436',
            borderRadius: '16px',
            padding: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div>
            <span className="badge-new" style={{ background: '#F5C518', color: '#000', marginBottom: '0.5rem' }}>
              THEATRE EXPERIENCE
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '0.4rem' }}>
              Engineered for Pure Cinematic Immersion
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
              Every seat is positioned for optimal sightlines and sound resonance. From laser-sharp 4K IMAX projection to Dolby Atmos multi-dimensional sound.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(229, 9, 20, 0.15)', borderRadius: '8px', color: 'var(--color-primary)' }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>IMAX with Laser</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Crystal-clear images and customized theatre geometry.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(229, 9, 20, 0.15)', borderRadius: '8px', color: 'var(--color-primary)' }}>
                <Volume2 size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Dolby Atmos Spatial Audio</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Precision acoustic engineering with overhead speaker arrays.</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(229, 9, 20, 0.15)', borderRadius: '8px', color: 'var(--color-primary)' }}>
                <Armchair size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>Luxury Motorized Recliners</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Plush ergonomics with in-seat food & beverage delivery service.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="container" style={{ marginTop: '4.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge-new" style={{ background: '#3B82F6' }}>COMING SOON</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>Upcoming Blockbusters</h2>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Get advance notification and reserve premiere day tickets
            </p>
          </div>

          <Link
            to="/movies?status=coming_soon"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#3B82F6',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            Explore All Upcoming <ChevronRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {comingSoon.map((movie) => (
            <div key={movie._id} className="movie-card">
              <Link to={`/movies/${movie.slug || movie._id}`} className="movie-poster-box">
                <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(11, 11, 14, 0.9)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#3B82F6',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </Link>
              <div className="movie-info-body">
                <Link to={`/movies/${movie.slug || movie._id}`}>
                  <h3 className="movie-card-title">{movie.title}</h3>
                </Link>
                <div className="movie-card-genres">{movie.genres?.join(', ')}</div>
                <div className="movie-card-footer">
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {movie.languages?.[0]}
                  </span>
                  <Link
                    to={`/movies/${movie.slug || movie._id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
