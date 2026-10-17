import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, CreditCard, Sparkles, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#07070A',
        borderTop: '1px solid #1E1E28',
        padding: '3.5rem 0 2rem 0',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        {/* Perks bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #1A1A24',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(229, 9, 20, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>IMAX & Dolby Atmos</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>True cinematic sound & vision</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(229, 9, 20, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Instant Digital E-Ticket</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>QR code access on mobile</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(229, 9, 20, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Flexible Cancellation</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Easy refund up to 2h before show</div>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <Link to="/" className="brand-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              <span>CINE</span>
              <span style={{ color: 'var(--color-primary)' }}>BOOK</span>
            </Link>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              India’s premier digital multiplex and movie ticket booking platform. Experience the thrill of IMAX Laser, 4DX motion, and gourmet dining.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Movies
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <Link to="/movies?status=now_showing">Now Showing</Link>
              <Link to="/movies?status=coming_soon">Coming Soon</Link>
              <Link to="/movies?format=IMAX">IMAX 3D Experience</Link>
              <Link to="/movies?genre=Action">Action & Thrillers</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Top Cities
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <span>Mumbai</span>
              <span>Delhi-NCR</span>
              <span>Bengaluru</span>
              <span>Hyderabad</span>
              <span>Chennai</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Cinema Tech
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              <span>IMAX 70mm & Laser</span>
              <span>Dolby Atmos 64-Channel</span>
              <span>4DX Environmental Motion</span>
              <span>Insignia Gold Recliners</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            borderTop: '1px solid #14141E',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <div>© {new Date().getFullYear()} CineBook Entertainment Ltd. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
