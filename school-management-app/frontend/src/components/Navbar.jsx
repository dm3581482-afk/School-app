import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../utils/api';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getHouseColor = (house) => {
    const colors = {
      red: '#dc2626',
      blue: '#2563eb',
      green: '#16a34a',
      yellow: '#f59e0b'
    };
    return colors[house] || '#64748b';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏫</span>
          <span>KVS School</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/map" className="navbar-link" onClick={() => setMenuOpen(false)}>
            3D Map
          </Link>
          <Link to="/book-appointment" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Book Appointment
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/community" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Community
              </Link>
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <Link to="/appointments" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  Appointments
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}

              <div className="navbar-user">
                <div className="user-info">
                  <span className="user-name">{user?.fullName}</span>
                  {user?.house && user.house !== 'none' && (
                    <span
                      className="user-house"
                      style={{ backgroundColor: getHouseColor(user.house) }}
                    >
                      {user.house}
                    </span>
                  )}
                  <span className="user-role">{user?.role}</span>
                </div>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>

              <button className="btn btn-secondary navbar-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
