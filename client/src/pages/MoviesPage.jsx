import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import { Search, Filter, Film, ArrowUpDown } from 'lucide-react';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentStatus = searchParams.get('status') || 'all';
  const currentGenre = searchParams.get('genre') || 'All';
  const currentLanguage = searchParams.get('language') || 'All';
  const currentFormat = searchParams.get('format') || 'All';
  const currentSort = searchParams.get('sort') || 'rating';
  const [searchTerm, setSearchTerm] = useState('');

  const genres = ['All', 'Action', 'Adventure', 'Sci-Fi', 'Drama', 'Animation', 'Biography', 'Comedy'];
  const languages = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];
  const formats = ['All', 'IMAX', '3D', '4DX', '2D'];

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'All' && val !== 'all') {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentStatus !== 'all') params.append('status', currentStatus);
        if (currentGenre !== 'All') params.append('genre', currentGenre);
        if (currentLanguage !== 'All') params.append('language', currentLanguage);
        if (currentFormat !== 'All') params.append('format', currentFormat);
        if (searchTerm) params.append('search', searchTerm);
        if (currentSort) params.append('sort', currentSort);

        const res = await axios.get(`/api/movies?${params.toString()}`);
        setMovies(res.data.movies || []);
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [currentStatus, currentGenre, currentLanguage, currentFormat, searchTerm, currentSort]);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
          Explore Movies
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Discover what's playing in theatres and reserve your seats across premium screens
        </p>
      </div>

      {/* Status Switch Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid #1E1E2C',
          paddingBottom: '1rem',
          marginBottom: '2rem',
        }}
      >
        <button
          onClick={() => updateParam('status', 'all')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            color: currentStatus === 'all' ? '#FFFFFF' : 'var(--color-text-muted)',
            cursor: 'pointer',
            position: 'relative',
            paddingBottom: '0.5rem',
          }}
        >
          All Movies
          {currentStatus === 'all' && (
            <div
              style={{
                position: 'absolute',
                bottom: '-1rem',
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--color-primary)',
              }}
            />
          )}
        </button>

        <button
          onClick={() => updateParam('status', 'now_showing')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            color: currentStatus === 'now_showing' ? '#FFFFFF' : 'var(--color-text-muted)',
            cursor: 'pointer',
            position: 'relative',
            paddingBottom: '0.5rem',
          }}
        >
          Now Showing
          {currentStatus === 'now_showing' && (
            <div
              style={{
                position: 'absolute',
                bottom: '-1rem',
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--color-primary)',
              }}
            />
          )}
        </button>

        <button
          onClick={() => updateParam('status', 'coming_soon')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            color: currentStatus === 'coming_soon' ? '#FFFFFF' : 'var(--color-text-muted)',
            cursor: 'pointer',
            position: 'relative',
            paddingBottom: '0.5rem',
          }}
        >
          Coming Soon
          {currentStatus === 'coming_soon' && (
            <div
              style={{
                position: 'absolute',
                bottom: '-1rem',
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--color-primary)',
              }}
            />
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          background: '#12121A',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid #1E1E2C',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by title, director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Genre Selector */}
        <div>
          <select
            value={currentGenre}
            onChange={(e) => updateParam('genre', e.target.value)}
            className="form-select"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                Genre: {g}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div>
          <select
            value={currentLanguage}
            onChange={(e) => updateParam('language', e.target.value)}
            className="form-select"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                Language: {l}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selector */}
        <div>
          <select
            value={currentFormat}
            onChange={(e) => updateParam('format', e.target.value)}
            className="form-select"
          >
            {formats.map((f) => (
              <option key={f} value={f}>
                Format: {f}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="form-select"
          >
            <option value="rating">Sort: Highest Rated</option>
            <option value="releaseDate">Sort: Latest Release</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={{ height: '380px', background: '#14141F', borderRadius: '12px' }} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#101016', borderRadius: '12px' }}>
          <Film size={42} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>No movies found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
            Try adjusting your search query, genre or language filter options.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
