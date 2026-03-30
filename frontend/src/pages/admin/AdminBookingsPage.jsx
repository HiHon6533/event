import { useState, useEffect } from 'react';
import { bookingApi } from '../../services/api';
import { formatCurrency, formatDateTime, STATUS_LABELS, STATUS_COLORS } from '../../utils/helpers';

export default function AdminBookingsPage() {
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
      <div className="admin-header"><h1>🎫 Quản lý đặt vé</h1></div>

      {loading ? <div className="spinner" /> : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Mã</th><th>Khách hàng</th><th>Sự kiện</th><th>Số vé</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th></tr>
              </thead>
              <tbody>
                {bookings.map(b => (
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
                    <td style={{ fontSize: '0.85rem' }}>{formatDateTime(b.bookingTime)}</td>
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
