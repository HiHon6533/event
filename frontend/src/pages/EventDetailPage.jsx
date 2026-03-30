import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, bookingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/helpers';
import { HiCalendar, HiLocationMarker, HiMinus, HiPlus } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    eventApi.getById(id)
      .then(res => setEvent(res.data))
      .catch(() => toast.error('Không tìm thấy sự kiện'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateQty = (tcId, delta, max) => {
    setQuantities(prev => {
      const current = prev[tcId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [tcId]: next };
    });
  };

  const totalAmount = event?.ticketCategories?.reduce((sum, tc) => {
    return sum + (quantities[tc.id] || 0) * tc.price;
  }, 0) || 0;

  const totalTickets = Object.values(quantities).reduce((s, q) => s + q, 0);

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    if (totalTickets === 0) { toast.error('Vui lòng chọn ít nhất 1 vé'); return; }

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([tcId, quantity]) => ({ ticketCategoryId: parseInt(tcId), quantity }));

    setBooking(true);
    try {
      const res = await bookingApi.create({ eventId: parseInt(id), items });
      toast.success('Đặt vé thành công!');
      navigate(`/bookings/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt vé thất bại');
    } finally { setBooking(false); }
  };

  if (loading) return <div className="container section"><div className="spinner" /></div>;
  if (!event) return <div className="container section"><div className="empty-state"><p>Không tìm thấy sự kiện</p></div></div>;

  return (
    <div className="container section fade-in">
      <img className="event-detail-banner" src={event.bannerUrl || event.thumbnailUrl} alt={event.title} />

      <div className="event-detail-grid">
        {/* Left: Info */}
        <div className="event-detail-info">
          <div style={{ marginBottom: 12 }}>
            <span className="badge" style={{ background: CATEGORY_COLORS[event.category], color: 'white' }}>
              {CATEGORY_LABELS[event.category]}
            </span>
          </div>
          <h1>{event.title}</h1>
          <div className="event-detail-meta">
            <span><HiCalendar size={18} /> {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}</span>
            <span><HiLocationMarker size={18} /> {event.venue?.name} - {event.venue?.city}</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {event.description}
          </div>
          {event.venue && (
            <div style={{ marginTop: 32, padding: 20, background: 'var(--bg-input)', borderRadius: 'var(--radius)' }}>
              <h3 style={{ marginBottom: 12, fontWeight: 700 }}>📍 Địa điểm</h3>
              <p style={{ fontWeight: 600 }}>{event.venue.name}</p>
              <p style={{ color: 'var(--text-muted)' }}>{event.venue.address}</p>
              {event.venue.phone && <p style={{ color: 'var(--text-muted)' }}>📞 {event.venue.phone}</p>}
            </div>
          )}
        </div>

        {/* Right: Ticket Panel */}
        <div className="ticket-panel">
          <h3>🎫 Chọn vé</h3>
          {event.ticketCategories?.length > 0 ? (
            <>
              {event.ticketCategories.map(tc => (
                <div key={tc.id} className="ticket-row">
                  <div className="ticket-info">
                    <h4>{tc.name}</h4>
                    <p>{tc.zoneName}</p>
                    <p>{tc.description}</p>
                    <p style={{ color: 'var(--success)', marginTop: 4 }}>Còn {tc.availableQuantity} vé</p>
                  </div>
                  <div>
                    <div className="ticket-price">{formatCurrency(tc.price)}</div>
                    <div className="ticket-qty">
                      <button onClick={() => updateQty(tc.id, -1, tc.maxPerBooking)}><HiMinus /></button>
                      <span>{quantities[tc.id] || 0}</span>
                      <button onClick={() => updateQty(tc.id, 1, Math.min(tc.maxPerBooking, tc.availableQuantity))}><HiPlus /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="ticket-total">
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tổng ({totalTickets} vé)</div>
                  <div className="ticket-total-amount">{formatCurrency(totalAmount)}</div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
                onClick={handleBooking} disabled={booking || totalTickets === 0}>
                {booking ? 'Đang xử lý...' : 'Đặt vé ngay'}
              </button>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Chưa có loại vé nào</p>
          )}
        </div>
      </div>
    </div>
  );
}
