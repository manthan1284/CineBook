import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Ban, CheckCircle2, Shield, Mail, Phone, MapPin } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=12`
      );
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast('Error loading users directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleToggleBlock = async (uId, currentBlockedState) => {
    try {
      const res = await axios.put(`/api/admin/users/${uId}/toggle-block`);
      showToast(res.data.message, res.data.isBlocked ? 'warning' : 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            Patrons & User Accounts
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Manage registered moviegoers, audit booking frequency, and moderate access.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', maxWidth: '420px', marginBottom: '1.75rem' }}>
        <Search size={16} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {/* Users Table */}
      <div
        style={{
          background: '#13131C',
          border: '1px solid #20202E',
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0F0F15', borderBottom: '1px solid #20202E', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                <th style={{ padding: '1rem' }}>USER PROFILE</th>
                <th style={{ padding: '1rem' }}>CONTACT INFO</th>
                <th style={{ padding: '1rem' }}>PREFERRED CITY</th>
                <th style={{ padding: '1rem' }}>BOOKINGS COUNT</th>
                <th style={{ padding: '1rem' }}>ROLE</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #1A1A24' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#20202E',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={u.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{u.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Member since {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                    <div>{u.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{u.phone || 'No phone'}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#fff' }}>
                    {u.preferredCity || 'Mumbai'}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {u.bookingsCount || 0} Tickets
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: u.role === 'admin' ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: u.role === 'admin' ? 'var(--color-primary)' : '#ddd',
                      }}
                    >
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: u.isBlocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: u.isBlocked ? '#EF4444' : '#10B981',
                      }}
                    >
                      {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                        className={`btn ${u.isBlocked ? 'btn-secondary' : 'btn-outline-danger'} btn-sm`}
                      >
                        {u.isBlocked ? 'Unblock Access' : 'Block User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                background: page === p ? 'var(--color-primary)' : '#14141E',
                border: '1px solid #242436',
                color: '#fff',
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
