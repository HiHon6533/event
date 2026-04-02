import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventApi } from '../services/api';
import { HiOutlineTicket, HiOutlineSearch, HiTrendingUp, HiOutlinePlusCircle } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const [showDrop, setShowDrop] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setShowDrop(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (showSuggestions && suggestions.length === 0) {
      eventApi.getSearchSuggestions().then(res => setSuggestions(res.data)).catch(() => {});
    }
  }, [showSuggestions]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setShowSuggestions(false);
      navigate(`/events?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate(`/events`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion);
    setShowSuggestions(false);
    navigate(`/events?keyword=${encodeURIComponent(suggestion)}`);
  };

  const handleCreateEventClick = () => {
    if (!user) {
      navigate('/login');
    } else if (isAdmin || isManager) {
      navigate('/admin/events');
    } else {
      navigate('/register-organizer');
    }
  };

  return (
    <nav className="navbar" style={{ zIndex: 100 }}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <HiOutlineTicket size={28} />
          <span>EventHub</span>
        </Link>

        {/* Global Search Bar */}
        <div className="navbar-search" ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '400px', margin: '0 20px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-lighter)', borderRadius: '20px', padding: '4px 12px' }}>
            <HiOutlineSearch color="var(--text-muted)" size={18} style={{ marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Bạn muốn tìm sự kiện gì?" 
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', flex: 1, padding: '6px 0' }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" style={{ display: 'none' }}></button>
          </form>

          {/* Hot Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && !keyword && (
            <div className="search-suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-lighter)', borderRadius: '12px', marginTop: '8px', padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', border: '1px solid var(--border)', zIndex: 101 }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiTrendingUp /> Gợi ý nổi bật
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {suggestions.map((sug, idx) => (
                  <li key={idx} onClick={() => handleSuggestionClick(sug)} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-primary)' }} onMouseOver={e => e.currentTarget.style.background='var(--bg-dark)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <HiOutlineSearch size={14} style={{ marginRight: '8px', color: 'var(--text-muted)' }} />
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Trang chủ</Link>
          <Link to="/events" className={isActive('/events')}>Sự kiện</Link>
          {user && <Link to="/bookings" className={isActive('/bookings')}>Vé của tôi</Link>}
          {(isAdmin || isManager) && <Link to="/admin" className={isActive('/admin')}>Quản trị</Link>}
          
          {/* Create Event CTA */}
          <button
            onClick={handleCreateEventClick}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', 
              color: '#fff', border: 'none', borderRadius: '20px', 
              padding: '6px 16px', cursor: 'pointer', fontWeight: 600, 
              fontSize: '0.85rem', whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <HiOutlinePlusCircle size={16} />
            Tạo sự kiện
          </button>
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
                    <small style={{ color: isAdmin ? '#e74c3c' : isManager ? '#3498db' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      {isAdmin ? '⚙️ Admin' : isManager ? '🏢 Ban tổ chức' : '👤 Người dùng'}
                    </small>
                  </div>
                  <Link to="/profile" className="dropdown-item">👤 Hồ sơ cá nhân</Link>
                  <Link to="/bookings" className="dropdown-item">🎫 Vé của tôi</Link>
                  {(isAdmin || isManager) && <Link to="/admin" className="dropdown-item">⚙️ Bảng điều khiển</Link>}
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
