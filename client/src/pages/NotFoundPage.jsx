import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '460px' }}>
        <div
          style={{
            fontSize: '5rem',
            fontWeight: 900,
            color: 'var(--color-primary)',
            letterSpacing: '0.05em',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
          Scene Not Found
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          The reel you're looking for seems to have been cut or misplaced. Let's return to the box office lobby!
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.8rem' }}>
          <Home size={18} /> Back to CineBook Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
