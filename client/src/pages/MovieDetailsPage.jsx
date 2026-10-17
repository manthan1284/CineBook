import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TrailerModal from '../components/TrailerModal';
import {
  Play,
  ArrowRight,
  Heart,
  Star,
  Clock,
  Calendar,
  Share2,
  CheckCircle2,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Review Form state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/movies/${id}`);
        setMovie(res.data.movie);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please log in to submit a movie review.', 'warning');
      navigate('/login');
      return;
    }

    if (!userComment.trim()) {
      showToast('Please enter your review comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await axios.post('/api/feedback', {
        movieId: movie._id,
        rating: userRating,
        comment: userComment,
      });

      showToast('Review submitted successfully!', 'success');
      setReviews([res.data.feedback, ...reviews.filter((r) => r.userId?._id !== user._id)]);
      setUserComment('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDuration = (mins) => {
    if (!mins) return '2h 15m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m (${mins} mins)`;
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center', color: 'var(--color-primary)' }}>
        Loading movie presentation...
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2>Movie not found.</h2>
        <Link to="/movies" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Movies
        </Link>
      </div>
    );
  }

  const resolveBackdrop = (m) => {
    if (!m) return '/images/wakanda-hero.jpg';
    const title = (m.title || '').toLowerCase();
    const url = m.backdropUrl || '';
    if (url.startsWith('/images/')) return url;
    if (title.includes('wakanda') || title.includes('black panther')) return '/images/wakanda-hero.jpg';
    if (title.includes('dune')) return '/images/dune-hero.jpg';
    if (title.includes('oppenheimer')) return '/images/oppenheimer-hero.jpg';
    if (title.includes('kalki')) return '/images/kalki-hero.jpg';
    if (title.includes('spider-man') || title.includes('spiderman')) return '/images/spiderman-hero.jpg';
    return url || '/images/wakanda-hero.jpg';
  };

  const resolvePoster = (url, title = '') => {
    if (!url) return '/images/kalki-poster.jpg';
    if (url.includes('6i8h9h2o3Y8E2v7O1Aevs6iUeR3') || title.toLowerCase().includes('kalki')) {
      return '/images/kalki-poster.jpg';
    }
    return url;
  };

  return (
    <div>
      {/* Cinematic Backdrop Banner */}
      <div
        style={{
          position: 'relative',
          minHeight: '480px',
          background: `url('${resolveBackdrop(movie)}') center top / cover no-repeat`,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(0deg, #0B0B0E 0%, rgba(11, 11, 14, 0.8) 50%, rgba(11, 11, 14, 0.4) 100%)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10, paddingBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Poster Card */}
            <div
              style={{
                width: '240px',
                aspectRatio: '2/3',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
                border: '1px solid #28283A',
                flexShrink: 0,
                backgroundColor: '#161622',
              }}
            >
              <img
                src={resolvePoster(movie.posterUrl, movie.title)}
                alt={movie.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  if (movie.title?.toLowerCase().includes('kalki')) {
                    e.currentTarget.src = '/images/kalki-poster.jpg';
                  }
                }}
              />
            </div>

            {/* Info details */}
            <div style={{ flex: '1 1 450px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge-new">{movie.certificate || 'UA'}</span>
                {movie.genres?.map((g) => (
                  <span key={g} className="genre-pill" style={{ padding: '0.25rem 0.85rem', fontSize: '0.8rem' }}>
                    {g}
                  </span>
                ))}
              </div>

              <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '0.75rem' }}>
                {movie.title}
              </h1>

              {/* Meta specs */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                }}
              >
                <span>{formatDuration(movie.duration)}</span>
                <span className="meta-separator">//</span>
                <span>{movie.languages?.join(', ')}</span>
                <span className="meta-separator">//</span>
                <span>{movie.formats?.join(', ')}</span>
                <span className="meta-separator">//</span>
                <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>

              {/* Ratings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span className="imdb-pill">IMDb</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    : {movie.imdbRating?.toFixed(1) || '8.0'}/10
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>
                  <Heart size={20} color="var(--color-primary)" fill="var(--color-primary)" />
                  <span>{movie.likesPercentage || 90}% <span style={{ fontWeight: 400, color: '#bbb' }}>Liked it</span></span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}
                >
                  <Play size={18} fill="#fff" /> Watch Trailer
                </button>

                <button
                  onClick={() => navigate(`/book/${movie.slug || movie._id}`)}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', fontWeight: 700 }}
                >
                  <ArrowRight size={18} /> Book Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem' }}>
          {/* Left Column: Synopsis & Cast */}
          <div style={{ flex: '1 1 60%' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.85rem' }}>
                Synopsis
              </h2>
              <p style={{ color: '#D0D0DE', fontSize: '1rem', lineHeight: '1.75' }}>
                {movie.synopsis}
              </p>
              {movie.director && (
                <div style={{ marginTop: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.92rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Director:</span>{' '}
                  <span style={{ color: '#fff', fontWeight: 700 }}>{movie.director}</span>
                </div>
              )}
            </div>

            {/* Cast & Crew Grid */}
            {movie.cast && movie.cast.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
                  Star Cast
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#13131B',
                        border: '1px solid #20202E',
                        borderRadius: '10px',
                        padding: '0.85rem',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          margin: '0 auto 0.65rem auto',
                          border: '2px solid rgba(229, 9, 20, 0.4)',
                        }}
                      >
                        <img
                          src={actor.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={actor.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {actor.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {actor.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: User Reviews & Feedback */}
          <div>
            <div
              style={{
                background: '#12121A',
                border: '1px solid #1E1E2C',
                borderRadius: '14px',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={20} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    Audience Reviews
                  </h3>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {reviews.length} Verified
                </span>
              </div>

              {/* Submit Review Form */}
              <form onSubmit={handleReviewSubmit} style={{ marginBottom: '2rem', paddingBottom: '1.75rem', borderBottom: '1px solid #20202E' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  Rate this movie:
                </div>
                {/* Star selection */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                      }}
                    >
                      <Star
                        size={24}
                        color={star <= userRating ? 'var(--color-imdb)' : '#444'}
                        fill={star <= userRating ? 'var(--color-imdb)' : 'none'}
                      />
                    </button>
                  ))}
                  <span style={{ marginLeft: '0.5rem', fontWeight: 700, color: '#F5C518', fontSize: '0.9rem' }}>
                    {userRating}/5 Stars
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <textarea
                    rows={3}
                    placeholder={isAuthenticated ? "Write your genuine movie review and experience..." : "Log in to share your review..."}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="form-textarea"
                    disabled={!isAuthenticated}
                    style={{ fontSize: '0.88rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Send size={14} /> {isAuthenticated ? 'Submit Review' : 'Sign In to Review'}
                </button>
              </form>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev._id} style={{ borderBottom: '1px solid #1A1A24', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#222',
                            }}
                          >
                            <img
                              src={rev.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                              alt="User"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>
                            {rev.userId?.name || 'Verified Moviegoer'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={12}
                              color={i < rev.rating ? 'var(--color-imdb)' : '#333'}
                              fill={i < rev.rating ? 'var(--color-imdb)' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#B0B0C0', lineHeight: '1.5' }}>
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    No reviews yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
};

export default MovieDetailsPage;
