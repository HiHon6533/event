import { Link, useNavigate } from 'react-router-dom';
import { HiCalendar, HiLocationMarker } from 'react-icons/hi';
import { formatCurrency, formatDateTime, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/helpers';

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const now = new Date();
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isEnded = endDate < now;
  const isUpcoming = startDate > now;
  const isOngoing = !isEnded && !isUpcoming;

  let badgeText = '';
  let badgeBg = '';

  if (event.status === 'PUBLISHED') {
    if (isUpcoming) {
      if (event.isSoldOut) {
        badgeText = 'Đã hết vé';
        badgeBg = '#e74c3c';
      } else {
        badgeText = 'Đang mở bán';
        badgeBg = 'var(--success)';
      }
    } else if (isOngoing) {
      badgeText = 'Đang diễn ra';
      badgeBg = 'var(--warning)';
    } else {
      badgeText = 'Đã diễn ra';
      badgeBg = '#95a5a6';
    }
  } else if (event.status === 'ONGOING') {
    badgeText = 'Đang diễn ra';
    badgeBg = 'var(--warning)';
  } else if (event.status === 'COMPLETED') {
    badgeText = 'Đã diễn ra';
    badgeBg = '#95a5a6';
  } else if (event.status === 'CANCELLED') {
    badgeText = 'Đã hủy';
    badgeBg = '#e74c3c';
  } else {
    badgeText = 'Bản nháp';
    badgeBg = '#f39c12';
  }

  return (
    <div className="card event-card fade-in" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: 'pointer' }}>
      <div className="event-card-img">
        <img src={event.thumbnailUrl || event.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'} alt={event.title} />
        <div className="event-card-badge">
          <span className="badge" style={{ background: CATEGORY_COLORS[event.category] || '#95a5a6', color: 'white' }}>
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
        </div>
        <div className="event-card-status-badge" style={{
          position: 'absolute', top: '10px', right: '10px',
          background: badgeBg,
          color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
        }}>
          {badgeText}
        </div>
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          <span><HiCalendar /> {formatDateTime(event.startTime)}</span>
          <span><HiLocationMarker /> {event.venueName} - {event.venueCity}</span>
        </div>
        <div className="event-card-footer">
          <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>Xem chi tiết →</span>
          {event.isFeatured && (
            <span className="badge" style={{ background: 'rgba(253,121,168,0.2)', color: 'var(--accent)' }}>🔥 Hot</span>
          )}
        </div>
      </div>
    </div>
  );
}
