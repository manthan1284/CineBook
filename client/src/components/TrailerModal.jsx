import React from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  if (!isOpen) return null;

  // Extract YouTube ID
  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '920px',
          backgroundColor: '#0E0E12',
          border: '1px solid #282836',
          borderRadius: '16px',
          overflow: 'hidden',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #22222D',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge-new" style={{ fontSize: '0.7rem' }}>TRAILER</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              {movieTitle} - Official Trailer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            style={{ position: 'static' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${movieTitle} Official Trailer`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              Trailer preview unavailable for this title.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
