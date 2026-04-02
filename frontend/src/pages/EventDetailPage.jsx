import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventApi, bookingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatDateTime, formatDate, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/helpers';
import { HiCalendar, HiLocationMarker, HiMinus, HiPlus, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import EventCard from '../components/EventCard';
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
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setRelatedEvents([]);
    eventApi.getById(id)
      .then(res => {
        setEvent(res.data);
        // Fetch related events by same category
        const ev = res.data;
        if (ev?.category) {
          eventApi.getPublished({ category: ev.category, size: 10 })
            .then(r => {
              const now = new Date();
              const items = (r.data?.content || [])
                .filter(e => e.id !== ev.id && new Date(e.endTime) >= now)
                .slice(0, 4);
              setRelatedEvents(items);
            }).catch(() => {});
        }
      })
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
    if (totalTickets === 0) { toast.error('Vui lòng chọn ít nhất 1 vé'); return; }

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([tcId, quantity]) => ({ ticketCategoryId: parseInt(tcId), quantity }));

    if (!user) { 
      toast.error('Hãy đăng nhập để đặt vé!');
      sessionStorage.setItem('pendingBooking', JSON.stringify({ eventId: parseInt(id), items }));
      navigate('/login');
      return; 
    }

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

  // Let's decide if the purchase is locked and what badges to show
  let btnBadge = null;
  let scheduleBadge = null;
  let isPurchaseLocked = false;

  // Check if ALL ticket categories are sold out
  const totalRemaining = event.ticketCategories?.reduce((acc, tc) => acc + tc.remainingQuantity, 0) || 0;
  const isSoldOut = event.ticketCategories?.length > 0 && totalRemaining <= 0;

  if (event.status === 'CANCELLED') {
    btnBadge = <span className="tb-status-badge" style={{ background: '#e74c3c', color: 'white', border: '1px solid #e74c3c' }}>Đã hủy</span>;
    scheduleBadge = <span className="tb-status-badge" style={{ background: '#e74c3c', color: 'white' }}>Suất diễn đã hủy</span>;
    isPurchaseLocked = true;
  } else if (event.status === 'COMPLETED' || (event.status === 'PUBLISHED' && isEnded)) {
    btnBadge = <span className="tb-status-badge tb-status-ended">Đã diễn ra</span>;
    scheduleBadge = <span className="tb-status-badge tb-status-ended">Suất diễn đã kết thúc</span>;
    isPurchaseLocked = true;
  } else if (event.status === 'ONGOING' || (event.status === 'PUBLISHED' && isOngoing)) {
    btnBadge = <span className="tb-status-badge tb-status-ongoing" style={{ background: 'var(--warning)', border: '1px solid var(--warning)' }}>Đang diễn ra</span>;
    scheduleBadge = <span className="tb-status-badge tb-status-ongoing" style={{ background: 'var(--warning)', color: 'white' }}>Suất diễn đang diễn ra</span>;
    isPurchaseLocked = true;
  } else if (event.status === 'PUBLISHED' && isUpcoming) {
    if (isSoldOut) {
      btnBadge = <span className="tb-status-badge" style={{ background: '#e74c3c', color: 'white', border: '1px solid #e74c3c' }}>Đã hết vé</span>;
      scheduleBadge = <span className="tb-status-badge" style={{ background: '#e74c3c', color: 'white' }}>Suất diễn đã hết vé</span>;
      isPurchaseLocked = true;
    } else {
      btnBadge = (
        <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('tb-schedule')?.scrollIntoView({ behavior: 'smooth' })}>
          Mua vé ngay
        </button>
      );
      scheduleBadge = <span className="tb-status-badge tb-status-upcoming">Suất diễn đang mở bán vé</span>;
      isPurchaseLocked = false;
    }
  } else {
    // DRAFT or others
    btnBadge = <span className="tb-status-badge" style={{ background: '#f39c12', color: 'white', border: 'none' }}>Bản nháp</span>;
    scheduleBadge = <span className="tb-status-badge" style={{ background: '#f39c12', color: 'white' }}>Bản nháp</span>;
    isPurchaseLocked = true;
  }

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
          SECTION 1: Hero — Blurred Banner + Ticket Card Overlay
          ═══════════════════════════════════════════════════ */}
      <div className="tb-hero-banner" style={{ backgroundImage: `url(${event.bannerUrl || event.thumbnailUrl || ''})` }}>
        <div className="tb-hero-banner-blur" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
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
                {btnBadge}
              </div>
            </div>

            {/* Right: Event Image (poster style) */}
            <div className="tb-ticket-image">
              <img 
                src={event.imageUrl || event.bannerUrl || event.thumbnailUrl} 
                alt={event.title} 
                onClick={() => document.getElementById('tb-schedule')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ cursor: 'pointer' }}
                title="Bấm để cuộn xuống xem Lịch diễn và Mua vé"
              />
            </div>

            {/* Ticket perforation effect */}
            <div className="tb-ticket-perforation tb-perf-top" />
            <div className="tb-ticket-perforation tb-perf-bottom" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: Giới thiệu
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

            {/* Event Description */}
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {event.description || event.shortDescription}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SECTION 2.5: Sơ đồ chỗ ngồi
          ═══════════════════════════════════════════════════ */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div className="tb-section-card">
          <div className="tb-section-header">
            <span className="tb-section-accent" style={{ background: 'var(--primary)' }} />
            <h2>Sơ đồ khu vực sân khấu</h2>
          </div>
          <div className="tb-section-body">
            {(event.mapUrl || seatMapUrl) ? (
              <div className="tb-seatmap-wrapper">
                <img
                  src={event.mapUrl || seatMapUrl}
                  alt={`Sơ đồ khu vực sân khấu - ${event.title}`}
                  className="tb-seatmap-img"
                  onClick={() => setMapExpanded(true)}
                  style={{ width: '100%', maxWidth: '800px', margin: '0 auto', display: 'block', borderRadius: '12px', cursor: 'pointer' }}
                />
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px' }}>
                  (Nhấn vào ảnh để phóng to)
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>Sơ đồ khu vực sân khấu đang được ban tổ chức cập nhật.</p>
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
            <div className="tb-schedule-row" style={{ marginBottom: '24px' }}>
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
                {scheduleBadge}
              </div>
            </div>

            {/* Calendar Widget */}
            {(() => {
              const startYear = startDate.getFullYear();
              const startMonth = startDate.getMonth();
              const firstDay = new Date(startYear, startMonth, 1);
              const lastDay = new Date(startYear, startMonth + 1, 0);
              
              // Map Sunday (0) -> 6, Monday (1) -> 0
              let startDayOfWeek = firstDay.getDay() - 1; 
              if (startDayOfWeek === -1) startDayOfWeek = 6;
              
              const days = [];
              const prevMonthDays = new Date(startYear, startMonth, 0).getDate();
              
              // Previous month padding
              for (let i = startDayOfWeek - 1; i >= 0; i--) {
                days.push({ id: `prev-${i}`, day: prevMonthDays - i, isCurrentMonth: false });
              }
              
              // Current month days
              const totalDays = lastDay.getDate();
              const eventStartDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const eventEndDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              
              // Calculate number of event days in this month
              let eventDaysCount = 0;
              
              for (let i = 1; i <= totalDays; i++) {
                const thisDay = new Date(startYear, startMonth, i);
                const hasEvent = thisDay >= eventStartDay && thisDay <= eventEndDay;
                if (hasEvent) eventDaysCount++;
                days.push({ id: `curr-${i}`, day: i, isCurrentMonth: true, hasEvent, isSelected: false }); // i === startDate.getDate() ? 
              }
              
              // Next month padding
              const remainingDays = (Math.ceil(days.length / 7) * 7) - days.length; 
              for (let i = 1; i <= remainingDays; i++) {
                days.push({ id: `next-${i}`, day: i, isCurrentMonth: false });
              }
              
              return (
                <div className="tb-calendar-container fade-in">
                  <div className="tb-calendar-header">
                    <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>&lt;</span>
                    <div className="tb-calendar-month-item active">
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>
                        Tháng {startMonth + 1}, {startYear}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{eventDaysCount} suất diễn</div>
                    </div>
                    <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>&gt;</span>
                  </div>
                  <div className="tb-calendar-weekdays">
                    <div>Thứ 2</div><div>Thứ 3</div><div>Thứ 4</div>
                    <div>Thứ 5</div><div>Thứ 6</div><div>Thứ 7</div>
                    <div>Chủ nhật</div>
                  </div>
                  <div className="tb-calendar-grid">
                    {days.map((item) => (
                      <div 
                        key={item.id} 
                        className={`tb-calendar-day ${item.isCurrentMonth ? 'current-month' : ''} ${item.hasEvent ? 'has-event' : ''} ${item.isSelected ? 'is-selected' : ''}`}
                      >
                        {item.day.toString().padStart(2, '0')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Thông tin vé */}
            <h3 style={{ fontWeight: 600, marginTop: '28px', marginBottom: '16px', fontSize: '1rem' }}>Thông tin vé</h3>

            {event.status === 'CANCELLED' ? (
              <p style={{ color: 'var(--error)', textAlign: 'center', padding: '30px', fontSize: '1.05rem', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '12px' }}>
                🚫 Sự kiện đã bị hủy. Hệ thống đã khóa chức năng hiển thị và mua vé.
              </p>
            ) : (
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

                            {!isSoldOut && !isPurchaseLocked && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Số lượng:</span>
                                <div className="ticket-qty">
                                  <button onClick={(e) => { e.stopPropagation(); updateQty(tc.id, -1, tc.maxPerBooking); }}><HiMinus /></button>
                                  <span>{qty}</span>
                                  <button onClick={(e) => { e.stopPropagation(); updateQty(tc.id, 1, Math.min(tc.maxPerBooking, tc.remainingQuantity)); }}><HiPlus /></button>
                                </div>
                              </div>
                            )}
                            {isPurchaseLocked && (
                              <p style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '10px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🔒 Hiện không thể mua vé trực tuyến
                              </p>
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
            )}

            {/* Checkout bar */}
            {totalTickets > 0 && !isPurchaseLocked && (
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

      {/* ═══ Có thể bạn cũng thích ═══ */}
      {relatedEvents.length > 0 && (
        <section className="related-events-section">
          <div className="container">
            <div className="related-events-header">
              <span style={{ fontSize: '1.4rem' }}>💡</span>
              <h2>Có thể bạn cũng thích</h2>
            </div>
            <div className="related-events-grid">
              {relatedEvents.map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        </section>
      )}

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
