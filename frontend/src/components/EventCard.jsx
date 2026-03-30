import { Link } from 'react-router-dom';
import { HiCalendar, HiLocationMarker } from 'react-icons/hi';
import { formatCurrency, formatDateTime, CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/helpers';

export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="card event-card">
      <div className="event-card-img">
        <img src={event.thumbnailUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'} alt={event.title} />
        <div className="event-card-badge">
          <span className="badge" style={{ background: CATEGORY_COLORS[event.category] || '#95a5a6', color: 'white' }}>
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
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
    </Link>
  );
}
