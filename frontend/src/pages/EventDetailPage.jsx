import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, bookingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime, formatDate, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/helpers';
import { HiCalendar, HiLocationMarker, HiMinus, HiPlus, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [booking, setBooking] = useState(false);
  const [expandedTc, setExpandedTc] = useState(null);
  const [mapExpanded, setMapExpanded] = useState(false);

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

  const seatMapUrl = event.venue?.seatMapImage;
  const minPrice = event.ticketCategories?.length > 0
    ? Math.min(...event.ticketCategories.map(tc => tc.price))
    : 0;

  const now = new Date();
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isEnded = endDate < now;
  const isUpcoming = startDate > now;
  const isOngoing = !isEnded && !isUpcoming;

  const formatVNDate = (dateStr) => {
    const d = new Date(dateStr);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[d.getDay()];
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return { time: `${hours}:${mins}`, dayName, full: formatDate(dateStr) };
  };

  const start = formatVNDate(event.startTime);
  const end = formatVNDate(event.endTime);

  return (
    <div className="fade-in">
      {/* ═══════════════════════════════════════════════════
          SECTION 1: Hero Ticket Card
          ═══════════════════════════════════════════════════ */}
      <div className="tb-hero">
        <div className="container">
          <div className="tb-ticket-card">
            {/* Left: Event Info */}
            <div className="tb-ticket-info">
              <h1 className="tb-ticket-title">{event.title}</h1>

              <div className="tb-ticket-meta">
                <div className="tb-ticket-meta-row">
                  <HiCalendar size={18} color="var(--success)" />
                  <span>{start.time} - {end.time}, {start.dayName}</span>
                </div>
                <div className="tb-ticket-meta-row">
                  <HiLocationMarker size={18} color="var(--accent)" />
                  <div>
                    <strong style={{ color: 'var(--secondary)' }}>{event.venue?.name}</strong>
                    <br />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{event.venue?.address}, {event.venue?.city}</span>
                  </div>
                </div>
              </div>

              <div className="tb-ticket-price-row">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Giá từ</span>
                <span className="tb-ticket-min-price">{formatCurrency(minPrice)}</span>
                <HiChevronRight size={20} color="var(--success)" />
              </div>

              <div className="tb-ticket-status-btn">
                {isEnded ? (
                  <span className="tb-status-badge tb-status-ended">Sự kiện đã kết thúc</span>
                ) : isUpcoming ? (
                  <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('tb-schedule')?.scrollIntoView({ behavior: 'smooth' })}>
                    Mua vé ngay
                  </button>
                ) : (
                  <span className="tb-status-badge tb-status-ongoing">Đang diễn ra</span>
                )}
              </div>
            </div>

            {/* Right: Event Image */}
            <div className="tb-ticket-image">
              <img src={event.bannerUrl || event.thumbnailUrl} alt={event.title} />
              <div className="tb-ticket-image-overlay">
                <span className="badge" style={{ background: CATEGORY_COLORS[event.category], color: 'white', fontSize: '0.85rem', padding: '6px 16px' }}>
                  {CATEGORY_LABELS[event.category]}
                </span>
              </div>
            </div>

            {/* Ticket perforation effect */}
            <div className="tb-ticket-perforation tb-perf-top" />
            <div className="tb-ticket-perforation tb-perf-bottom" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: Giới thiệu (Sơ đồ chỗ ngồi)
          ═══════════════════════════════════════════════════ */}
      <div className="container" style={{ marginTop: '48px' }}>
        <div className="tb-section-card">
          <div className="tb-section-header">
            <span className="tb-section-accent" />
            <h2>Giới thiệu</h2>
          </div>
          <div className="tb-section-body">
            {/* Event title */}
            <h3 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
              {event.title}
            </h3>

            {/* Seat map image or description */}
            {seatMapUrl ? (
              <div className="tb-seatmap-wrapper">
                <img
                  src={seatMapUrl}
                  alt={`Sơ đồ chỗ ngồi - ${event.venue?.name}`}
                  className="tb-seatmap-img"
                  onClick={() => setMapExpanded(true)}
                />
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>
                  (Nhấn vào ảnh để phóng to)
                </p>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {event.description || event.shortDescription}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 3: Lịch diễn + Thông tin vé
          ═══════════════════════════════════════════════════ */}
      <div className="container" style={{ marginTop: '32px' }} id="tb-schedule">
        <div className="tb-section-card">
          <div className="tb-section-header">
            <span className="tb-section-accent" />
            <h2>Lịch diễn</h2>
          </div>
          <div className="tb-section-body">
            {/* Schedule row */}
            <div className="tb-schedule-row">
              <div className="tb-schedule-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HiChevronDown size={20} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{start.time} - {end.time}, {start.dayName}</div>
                    <div style={{ color: 'var(--success)', fontSize: '0.9rem' }}>{start.full}</div>
                  </div>
                </div>
              </div>
              <div>
                {isEnded ? (
                  <span className="tb-status-badge tb-status-ended">Suất diễn đã kết thúc</span>
                ) : isUpcoming ? (
                  <span className="tb-status-badge tb-status-upcoming">Sắp diễn ra</span>
                ) : (
                  <span className="tb-status-badge tb-status-ongoing">Đang diễn ra</span>
                )}
              </div>
            </div>

            {/* Thông tin vé */}
            <h3 style={{ fontWeight: 600, marginTop: '28px', marginBottom: '16px', fontSize: '1rem' }}>Thông tin vé</h3>

            <div className="tb-ticket-list">
              {event.ticketCategories?.length > 0 ? (
                event.ticketCategories.map(tc => {
                  const isExpanded = expandedTc === tc.id;
                  const isSoldOut = tc.remainingQuantity <= 0;
                  const qty = quantities[tc.id] || 0;
                  return (
                    <div key={tc.id} className={`tb-ticket-item ${isExpanded ? 'tb-ticket-item-expanded' : ''}`}>
                      {/* Header row */}
                      <div
                        className="tb-ticket-item-header"
                        onClick={() => setExpandedTc(isExpanded ? null : tc.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {isExpanded ? <HiChevronDown size={18} /> : <HiChevronRight size={18} />}
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tc.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formatCurrency(tc.price)}</span>
                          {isSoldOut ? (
                            <span className="tb-badge-soldout">Hết vé</span>
                          ) : (
                            <span className="tb-badge-available">Còn vé</span>
                          )}
                        </div>
                      </div>

                      {/* Expanded: description + quantity */}
                      {isExpanded && (
                        <div className="tb-ticket-item-body fade-in">
                          {tc.description && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '12px' }}>{tc.description}</p>
                          )}
                          {tc.zoneName && (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>📍 Khu vực: {tc.zoneName}</p>
                          )}
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
                            Còn lại: <strong style={{ color: 'var(--success)' }}>{tc.remainingQuantity}</strong> / {tc.totalQuantity} vé • Tối đa {tc.maxPerBooking} vé/đơn
                          </p>

                          {!isSoldOut && !isEnded && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Số lượng:</span>
                              <div className="ticket-qty">
                                <button onClick={(e) => { e.stopPropagation(); updateQty(tc.id, -1, tc.maxPerBooking); }}><HiMinus /></button>
                                <span>{qty}</span>
                                <button onClick={(e) => { e.stopPropagation(); updateQty(tc.id, 1, Math.min(tc.maxPerBooking, tc.remainingQuantity)); }}><HiPlus /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chưa có thông tin vé.</p>
              )}
            </div>

            {/* Checkout bar */}
            {totalTickets > 0 && (
              <div className="tb-checkout-bar fade-in">
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tổng cộng ({totalTickets} vé)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{formatCurrency(totalAmount)}</div>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleBooking}
                  disabled={booking}
                  style={{ minWidth: '180px' }}
                >
                  {booking ? 'Đang xử lý...' : 'Đặt vé ngay'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 4: Ban tổ chức
          ═══════════════════════════════════════════════════ */}
      <div className="container" style={{ marginTop: '32px', marginBottom: '60px' }}>
        <div className="tb-section-card">
          <div className="tb-section-header">
            <span className="tb-section-accent" />
            <h2>Ban tổ chức</h2>
          </div>
          <div className="tb-section-body">
            <div className="tb-organizer">
              <div className="tb-organizer-avatar">
                {event.managerName?.charAt(0) || 'B'}
              </div>
              <div className="tb-organizer-info">
                <h4>{event.managerName || 'Ban Tổ Chức Sự Kiện'}</h4>
                <p>Đơn vị tổ chức & sản xuất sự kiện</p>
                {event.venue && (
                  <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                    📍 {event.venue.name}, {event.venue.city}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen map overlay */}
      {mapExpanded && seatMapUrl && (
        <div className="tb-map-overlay" onClick={() => setMapExpanded(false)}>
          <img src={seatMapUrl} alt="Sơ đồ phóng to" />
          <div className="tb-map-close">✕ Đóng</div>
        </div>
      )}
    </div>
  );
}
