import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Star, Trash2, CheckCircle2, Film, User } from 'lucide-react';

const AdminFeedbackPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/feedback/admin');
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      showToast('Error loading reviews moderation list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (rId) => {
    if (!window.confirm('Are you sure you want to remove this audience review?')) return;
    try {
      await axios.delete(`/api/feedback/${rId}`);
      showToast('Review removed.', 'success');
      fetchReviews();
    } catch (err) {
      showToast('Failed to remove review.', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
          Audience Feedback & Review Moderation
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Review ratings submitted by verified moviegoers and curate public testimonials.
        </p>
      </div>

      <div
        style={{
          background: '#13131C',
          border: '1px solid #20202E',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0F0F15', borderBottom: '1px solid #20202E', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '1rem' }}>MOVIE</th>
                <th style={{ padding: '1rem' }}>USER</th>
                <th style={{ padding: '1rem' }}>RATING</th>
                <th style={{ padding: '1rem' }}>REVIEW COMMENT</th>
                <th style={{ padding: '1rem' }}>DATE</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev._id} style={{ borderBottom: '1px solid #1A1A24' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {rev.movieId?.title || 'Unknown Title'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                    {rev.userId?.name || 'Verified Patron'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={13}
                          color={i < rev.rating ? 'var(--color-imdb)' : '#444'}
                          fill={i < rev.rating ? 'var(--color-imdb)' : 'none'}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#D0D0DE', maxWidth: '380px' }}>
                    "{rev.comment}"
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteReview(rev._id)}
                      className="btn btn-outline-danger btn-sm"
                      title="Delete / Moderate Review"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
