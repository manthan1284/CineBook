import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  const resolvePoster = (url, title = '') => {
    if (!url) return '/images/kalki-poster.jpg';
    if (url.includes('6i8h9h2o3Y8E2v7O1Aevs6iUeR3') || title.toLowerCase().includes('kalki')) {
      return '/images/kalki-poster.jpg';
    }
    return url;
  };

  return (
    <div className="movie-card">
      <Link to={`/movies/${movie.slug || movie._id}`} className="movie-poster-box">
        <img
          src={resolvePoster(movie.posterUrl, movie.title)}
          alt={movie.title}
          loading="lazy"
          onError={(e) => {
            if (movie.title?.toLowerCase().includes('kalki')) {
              e.currentTarget.src = '/images/kalki-poster.jpg';
            }
          }}
        />

        {/* Rating overlay badge */}
        <div className="movie-rating-badge">
          <Star size={13} color="var(--color-imdb)" fill="var(--color-imdb)" />
          <span>{movie.imdbRating?.toFixed(1) || '8.0'}</span>
        </div>

        {/* Format tags */}
        <div className="movie-format-chips">
          {movie.formats?.slice(0, 2).map((fmt) => (
            <span key={fmt} className="format-chip">
              {fmt}
            </span>
          ))}
        </div>
      </Link>

      <div className="movie-info-body">
        <Link to={`/movies/${movie.slug || movie._id}`}>
          <h3 className="movie-card-title" title={movie.title}>
            {movie.title}
          </h3>
        </Link>

        <div className="movie-card-genres">
          {movie.genres?.slice(0, 3).join(', ')} • {movie.languages?.[0] || 'English'}
        </div>

        <div className="movie-card-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#ff4d6d' }}>
            <Heart size={14} fill="#ff4d6d" />
            <span style={{ fontWeight: 600 }}>{movie.likesPercentage || 90}%</span>
          </div>

          <button
            onClick={() => navigate(`/book/${movie.slug || movie._id}`)}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
          >
            Book Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
