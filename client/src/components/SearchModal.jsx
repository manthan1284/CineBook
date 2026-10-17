import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Film, Clock, Star } from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/movies?search=${encodeURIComponent(query)}`);
        setResults(res.data.movies || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (movie) => {
    onClose();
    navigate(`/movies/${movie.slug || movie._id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '680px',
          padding: '1.5rem',
          backgroundColor: '#121218',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            paddingBottom: '1rem',
          }}
        >
          <Search size={22} color="var(--color-primary)" />
          <input
            type="text"
            placeholder="Search movies, genres, actors, languages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '1.1rem',
              outline: 'none',
              fontFamily: 'var(--font-main)',
            }}
          />
          <button onClick={onClose} className="modal-close-btn" style={{ position: 'static' }}>
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div style={{ marginTop: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Searching CineBook catalog...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {results.map((m) => (
                <div
                  key={m._id}
                  onClick={() => handleSelect(m)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--color-bg-base)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#1A1A24')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-base)')}
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    style={{ width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{m.title}</div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '0.2rem',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Star size={12} color="var(--color-imdb)" fill="var(--color-imdb)" />
                        {m.imdbRating}/10
                      </span>
                      <span>•</span>
                      <span>{m.genres?.slice(0, 2).join(', ')}</span>
                      <span>•</span>
                      <span>{m.languages?.join(', ')}</span>
                    </div>
                  </div>
                  <span className="btn btn-primary btn-sm">Book</span>
                </div>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Film size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <div>No movies found matching "{query}".</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Try searching for "Wakanda", "Oppenheimer", "Dune", or "Action".
              </div>
            </div>
          )}

          {!query && (
            <div style={{ padding: '1rem 0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                POPULAR SEARCHES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Black Panther', 'Oppenheimer', 'Dune', 'Kalki 2898 AD', 'IMAX', 'Action'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-secondary)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
