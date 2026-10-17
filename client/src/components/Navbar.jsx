import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import {
  Search,
  MapPin,
  User as UserIcon,
  Ticket,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import CityModal from './CityModal';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <>
      <header className="navbar">
        <div className="container nav-wrapper">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <span>CINE</span>
            <span style={{ color: 'var(--color-primary)' }}>BOOK</span>
          </Link>

          {/* Desktop Nav Links matching reference image */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `nav-link ${isActive && location.pathname === '/' ? 'active' : ''}`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/movies"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Movies
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/theatres"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Theater
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(true)}
                  className="nav-link"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  Location
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(229, 9, 20, 0.15)',
                      color: 'var(--color-primary)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {selectedCity}
                  </span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Search Icon matching reference image */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="nav-btn-icon"
              title="Search movies, languages & formats"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Profile Avatar Icon with Red Outline */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="profile-avatar-btn"
                title={isAuthenticated ? user.name : 'Account menu'}
                aria-label="User Account"
              >
                {isAuthenticated && user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <UserIcon size={20} color="var(--color-primary)" />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '260px',
                    background: '#14141C',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.85)',
                    padding: '0.75rem',
                    zIndex: 200,
                    animation: 'slideInRight 0.2s ease',
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <div
                        style={{
                          padding: '0.5rem 0.75rem 0.75rem',
                          borderBottom: '1px solid var(--color-border-subtle)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                          {user.name}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          {user.email}
                        </div>
                        {isAdmin && (
                          <span
                            style={{
                              marginTop: '0.35rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'var(--color-primary)',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            <Shield size={10} /> ADMIN ACCESS
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.65rem',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '6px',
                              color: '#FFFFFF',
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              background: 'rgba(229, 9, 20, 0.1)',
                            }}
                          >
                            <Shield size={16} color="var(--color-primary)" />
                            Admin Console
                          </Link>
                        )}

                        <Link
                          to="/my-bookings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.88rem',
                          }}
                        >
                          <Ticket size={16} />
                          My Bookings
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.88rem',
                          }}
                        >
                          <Settings size={16} />
                          Profile Settings
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '6px',
                            color: '#ff4d6d',
                            background: 'transparent',
                            border: 'none',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            marginTop: '0.25rem',
                            borderTop: '1px solid var(--color-border-subtle)',
                            paddingTop: '0.65rem',
                          }}
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.2rem' }}>
                      <Link
                        to="/login"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="nav-btn-icon mobile-nav-toggle"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(11, 11, 14, 0.98)',
            backdropFilter: 'blur(16px)',
            zIndex: 99,
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}
          >
            Home
          </Link>
          <Link
            to="/movies"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}
          >
            Movies
          </Link>
          <Link
            to="/theatres"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}
          >
            Theatres
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCityModalOpen(true);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '1.1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <MapPin size={18} /> City: {selectedCity}
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}

      {/* Global Modals */}
      <CityModal />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
