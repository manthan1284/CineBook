import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  CalendarClock,
  Armchair,
  Ticket,
  Users,
  MessageSquare,
  FileSpreadsheet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Movies', path: '/admin/movies', icon: Film },
    { name: 'Theatres & Screens', path: '/admin/theatres', icon: Building2 },
    { name: 'Show Scheduling', path: '/admin/shows', icon: CalendarClock },
    { name: 'Bookings & Refunds', path: '/admin/bookings', icon: Ticket },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Review Moderation', path: '/admin/feedback', icon: MessageSquare },
    { name: 'Reports & Export', path: '/admin/reports', icon: FileSpreadsheet },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Bar */}
      <div
        style={{
          display: 'none',
          padding: '0.75rem 1rem',
          background: '#101017',
          borderBottom: '1px solid #20202C',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        className="admin-mobile-bar"
      >
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
          <span>CINE</span>
          <span style={{ color: 'var(--color-primary)' }}>ADMIN</span>
        </Link>
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside
        style={{
          width: collapsed ? '75px' : '260px',
          background: '#0E0E14',
          borderRight: '1px solid #20202C',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 90,
        }}
        className={`admin-sidebar-desktop ${mobileDrawerOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem 1rem',
            borderBottom: '1px solid #1A1A24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          {!collapsed && (
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '1.2rem' }}>
              <span>CINE</span>
              <span style={{ color: 'var(--color-primary)' }}>BOOK</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginLeft: '4px',
                }}
              >
                ADMIN
              </span>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'var(--color-text-secondary)',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Card */}
        {!collapsed && (
          <div
            style={{
              padding: '1rem',
              margin: '0.75rem',
              borderRadius: '8px',
              background: '#151520',
              border: '1px solid #222232',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '2px solid var(--color-primary)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt="Admin"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Super Admin
              </div>
            </div>
          </div>
        )}

        {/* Nav list */}
        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setMobileDrawerOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  transition: 'all 0.15s ease',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                })}
                title={collapsed ? item.name : ''}
              >
                <Icon size={19} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Exit */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid #1A1A24', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'var(--color-text-secondary)',
              fontSize: '0.88rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <ChevronLeft size={18} />
            {!collapsed && <span>Exit to Client View</span>}
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: '#ff4d6d',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.88rem',
              textAlign: 'left',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
