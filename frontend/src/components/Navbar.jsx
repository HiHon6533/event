import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineTicket } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const [showDrop, setShowDrop] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setShowDrop(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <HiOutlineTicket size={28} />
          <span>EventHub</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Trang chủ</Link>
          <Link to="/events" className={isActive('/events')}>Sự kiện</Link>
          {user && <Link to="/bookings" className={isActive('/bookings')}>Vé của tôi</Link>}
          {(isAdmin || isManager) && <Link to="/admin" className={isActive('/admin')}>Quản trị</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user" ref={ref} onClick={() => setShowDrop(!showDrop)}>
              <div className="navbar-avatar">{user.fullName?.charAt(0)}</div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.fullName}</span>
              
              {showDrop && (
                <div className="user-dropdown slide-up">
                  <div className="dropdown-info">
                    <strong>{user.fullName}</strong>
                    <small>{user.email}</small>
                  </div>
                  <Link to="/bookings" className="dropdown-item">🎫 Vé của tôi</Link>
                  <button onClick={logout} className="dropdown-item text-danger">Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
