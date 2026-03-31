import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime, STATUS_LABELS, STATUS_COLORS } from '../utils/helpers';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    bookingApi.getMy({ page, size: 10 })
      .then(res => { setBookings(res.data.content); setTotalPages(res.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="container section fade-in" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">{user?.fullName?.charAt(0)}</div>
        <div>
          <h2 style={{ fontWeight: 700 }}>{user?.fullName}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>
      </div>

      <h2 style={{ fontWeight: 700, marginBottom: 24 }}>🎫 Vé của tôi</h2>

      {loading ? <div className="spinner" /> : (
        <>
          {bookings.length > 0 ? bookings.map(b => (
            <Link to={`/bookings/${b.id}`} key={b.id} className="booking-card">
              <div className="booking-header">
                <div>
                  <div className="booking-code">#{b.bookingCode}</div>
                  <h3 style={{ fontWeight: 600, marginTop: 4 }}>{b.eventTitle}</h3>
                </div>
                <span className="badge" style={{ background: STATUS_COLORS[b.status], color: 'white' }}>
                  {STATUS_LABELS[b.status] || b.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <span>{formatDateTime(b.bookingDate)} • {b.totalTickets} vé</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{formatCurrency(b.totalAmount)}</span>
              </div>
            </Link>
          )) : (
            <div className="empty-state">
              <p>Bạn chưa có đơn đặt vé nào</p>
              <Link to="/events" className="btn btn-primary" style={{ marginTop: 16 }}>Khám phá sự kiện</Link>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === page ? 'active' : ''} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
