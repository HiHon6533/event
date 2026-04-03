import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingApi, paymentApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime, formatDate, STATUS_LABELS, STATUS_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    bookingApi.getById(id)
      .then(res => setBooking(res.data))
      .catch(() => toast.error('Không tìm thấy đơn đặt vé'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await paymentApi.createVnPayUrl(parseInt(id));
      if (res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl; // Chuyển hướng sang VNPay
      } else {
        toast.error('Không thể lấy liên kết thanh toán');
        setPaying(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi kết nối Cổng thanh toán');
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Bạn chắc chắn muốn hủy đơn đặt vé này?')) return;
    try {
      await bookingApi.cancel(id);
      toast.success('Đã hủy đơn đặt vé');
      const res = await bookingApi.getById(id);
      setBooking(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hủy thất bại');
    }
  };

  if (loading) return <div className="container section"><div className="spinner" /></div>;
  if (!booking) return <div className="container section"><div className="empty-state"><p>Không tìm thấy</p></div></div>;

  return (
    <div className="container section fade-in" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Chi tiết đặt vé</h1>
          <div className="booking-code" style={{ fontSize: '1.1rem', marginTop: 4 }}>#{booking.bookingCode}</div>
        </div>
        <span className="badge" style={{ background: STATUS_COLORS[booking.status], color: 'white', fontSize: '0.85rem', padding: '6px 16px' }}>
          {STATUS_LABELS[booking.status] || booking.status}
        </span>
      </div>

      {/* Event Info */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📅 {booking.eventTitle}</h3>
        {booking.eventDate && (
          <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 8 }}>
            Ngày tham gia đi xem: {formatDate(booking.eventDate)}
          </p>
        )}
        <p style={{ color: 'var(--text-muted)' }}>Thời gian đặt: {formatDateTime(booking.bookingDate)}</p>
      </div>

      {/* Ticket Details */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>🎫 Chi tiết vé</h3>
        {booking.bookingDetails?.map(d => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{d.ticketCategoryName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{d.zoneName} × {d.quantity}</div>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{formatCurrency(d.subtotal)}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, fontWeight: 800, fontSize: '1.2rem' }}>
          <span>Tổng cộng</span>
          <span style={{ color: 'var(--accent)' }}>{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>

      {/* Payment Info */}
      {booking.payment && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>💳 Thanh toán</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Phương thức: {booking.payment.paymentMethod}</span>
            <span className="badge" style={{ background: STATUS_COLORS[booking.payment.status], color: 'white' }}>
              {STATUS_LABELS[booking.payment.status]}
            </span>
          </div>
        </div>
      )}

      {/* Virtual E-Ticket Email Confirmation */}
      {booking.status === 'CONFIRMED' && (
        <div className="card" style={{ padding: 24, marginBottom: 24, textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 8, color: '#2e8b57' }}>📱 Vé Điện Tử</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Mã QR vé điện tử đã được gửi về email của bạn.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vui lòng kiểm tra hộp thư đến (và thư mục rác) để lấy mã Check-in tại cổng sự kiện.</p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        {booking.status === 'PENDING' && (
          <>
            <button className="btn btn-primary" onClick={handlePayment} disabled={paying}>
              {paying ? 'Đang xử lý...' : '💳 Thanh toán'}
            </button>
            <button className="btn btn-danger" onClick={handleCancel}>Hủy đơn</button>
          </>
        )}
        <Link to="/bookings" className="btn btn-outline">← Quay lại</Link>
      </div>
    </div>
  );
}
