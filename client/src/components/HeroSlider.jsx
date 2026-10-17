import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Heart } from 'lucide-react';
import TrailerModal from './TrailerModal';

const HeroSlider = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const navigate = useNavigate();

  // Helper to map movie backdrops to local high-res 4K images
  const resolveBackdrop = (movie) => {
    if (!movie) return '/images/wakanda-hero.jpg';
    const title = (movie.title || '').toLowerCase();
    const url = movie.backdropUrl || '';
    if (url.startsWith('/images/')) return url;
    if (title.includes('wakanda') || title.includes('black panther')) return '/images/wakanda-hero.jpg';
    if (title.includes('dune')) return '/images/dune-hero.jpg';
    if (title.includes('oppenheimer')) return '/images/oppenheimer-hero.jpg';
    if (title.includes('kalki')) return '/images/kalki-hero.jpg';
    if (title.includes('spider-man') || title.includes('spiderman')) return '/images/spiderman-hero.jpg';
    return url || '/images/wakanda-hero.jpg';
  };

  // If no movies provided, use fallback
  const currentMovie = movies[currentIndex] || {
    title: 'Black Panther: Wakanda Forever',
    genres: ['Action', 'Adventure', 'Fantasy'],
    duration: 161,
    languages: ['English'],
    formats: ['3D', '4D', 'IMAX'],
    certificate: 'PG13',
    synopsis:
      "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T'Challa's death. As the Wakandans strive to embrace their next chapter, the heroes must band together with Nakia and Everett Ross to forge a new path for their beloved kingdom.",
    imdbRating: 8.0,
    likesPercentage: 90,
    trailerUrl: 'https://www.youtube.com/watch?v=_Z3QKfv30tU',
    backdropUrl: '/images/wakanda-hero.jpg',
  };

  // Convert minutes to "2 HRS 41 MINS" format
  const formatDuration = (mins) => {
    if (!mins) return '2 HRS 15 MINS';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} HRS ${m} MINS`;
  };

  // Auto advance slides every 8 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  return (
    <section className="hero-slider-wrap">
      {/* Background with custom atmospheric shading */}
      <div
        className="hero-backdrop"
        key={currentMovie._id || currentMovie.title}
        style={{
          backgroundImage: `url('${resolveBackdrop(currentMovie)}')`,
        }}
      />
      <div className="hero-gradient-overlay" />

      {/* Main hero showcase matching reference image */}
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="hero-content">
          {/* "NEW" Pill */}
          <div>
            <span className="badge-new">NEW</span>
          </div>

          {/* Big Title */}
          <h1 className="hero-title">{currentMovie.title}</h1>

          {/* Genre Pills */}
          <div className="hero-genres-row">
            {currentMovie.genres?.map((genre) => (
              <span key={genre} className="genre-pill">
                {genre}
              </span>
            ))}
          </div>

          {/* Meta Specifications with Red // Separators */}
          <div className="hero-meta-row">
            <span>{formatDuration(currentMovie.duration)}</span>
            <span className="meta-separator">//</span>
            <span>{currentMovie.languages?.[0]?.toUpperCase() || 'ENGLISH'}</span>
            <span className="meta-separator">//</span>
            <span>{currentMovie.formats?.join(', ') || '3D, 4D, IMAX'}</span>
            <span className="meta-separator">//</span>
            <span>{currentMovie.certificate || 'PG13'}</span>
          </div>

          {/* Plot Section */}
          <div className="hero-plot-section">
            <div className="hero-plot-label">PLOT:-</div>
            <p className="hero-plot-text">{currentMovie.synopsis}</p>
          </div>

          {/* Ratings Row with IMDb Gold Pill and Heart */}
          <div className="hero-ratings-row">
            <div className="rating-item">
              <span className="imdb-pill">IMDb</span>
              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>
                : {currentMovie.imdbRating ? currentMovie.imdbRating.toFixed(1) : '8.0'}/10
              </span>
            </div>

            <div className="rating-item" style={{ color: '#FFFFFF' }}>
              <Heart
                size={22}
                color="var(--color-primary)"
                fill="var(--color-primary)"
                style={{ filter: 'drop-shadow(0 0 6px rgba(229, 9, 20, 0.6))' }}
              />
              <span style={{ fontWeight: 800 }}>
                {currentMovie.likesPercentage || 90}%{' '}
                <span style={{ fontWeight: 500, color: '#C8C8D4' }}>Liked it</span>
              </span>
            </div>
          </div>

          {/* Action Buttons matching reference image */}
          <div className="hero-buttons-row">
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="btn btn-primary"
              style={{
                borderRadius: '8px',
                padding: '0.8rem 1.75rem',
                fontSize: '1.05rem',
                fontWeight: 700,
              }}
            >
              <Play size={18} fill="#FFFFFF" />
              Trailer
            </button>

            <button
              onClick={() => navigate(`/book/${currentMovie.slug || currentMovie._id}`)}
              className="btn btn-primary"
              style={{
                borderRadius: '8px',
                padding: '0.8rem 1.85rem',
                fontSize: '1.05rem',
                fontWeight: 700,
              }}
            >
              <ArrowRight size={18} />
              Book Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Slider indicators */}
      {movies.length > 1 && (
        <div className="hero-slider-dots">
          {movies.map((m, idx) => (
            <div
              key={m._id || idx}
              className={`slider-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              title={m.title}
            />
          ))}
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={currentMovie.trailerUrl}
        movieTitle={currentMovie.title}
      />
    </section>
  );
};

export default HeroSlider;
