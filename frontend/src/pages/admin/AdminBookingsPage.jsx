import { useState, useEffect } from 'react';
import { bookingApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDateTime, STATUS_LABELS, STATUS_COLORS } from '../../utils/helpers';

export default function AdminBookingsPage() {
  const { isAdmin, isManager } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    bookingApi.getAll({ page, size: 20 })
      .then(res => { setBookings(res.data.content); setTotalPages(res.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <div className="admin-header">
        <h1>🎫 {isManager ? 'Đơn đặt vé (Sự kiện của tôi)' : 'Quản lý Đặt vé'}</h1>
        {isManager && <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>Chỉ hiển thị đơn đặt vé thuộc sự kiện bạn quản lý</p>}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã</th><th>Khách hàng</th><th>Sự kiện</th><th>Số vé</th><th>Tổng tiền</th><th>Trạng thái</th><th>Check-in</th><th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {isManager ? 'Chưa có đơn đặt vé nào cho sự kiện của bạn' : 'Chưa có đơn đặt vé nào'}
                  </td></tr>
                ) : bookings.map(b => (
                  <tr key={b.id}>
                    <td className="booking-code">{b.bookingCode}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.userFullName || 'Khách vãng lai'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.userEmail}</div>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.eventTitle}</td>
                    <td>{b.totalTickets}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span className="badge" style={{ background: STATUS_COLORS[b.status], color: 'white' }}>
                        {STATUS_LABELS[b.status] || b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'CONFIRMED' ? (
                        <span className="badge" style={{ background: b.isCheckedIn ? '#27ae60' : '#95a5a6', color: 'white', fontSize: '0.75rem' }}>
                          {b.isCheckedIn ? '✓ Đã vào' : '— Chưa'}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{formatDateTime(b.bookingDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === page ? 'active' : ''} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
