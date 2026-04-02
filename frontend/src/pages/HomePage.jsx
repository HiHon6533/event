import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventApi } from '../services/api';
import EventSlider from '../components/EventSlider';
import { formatCurrency } from '../utils/helpers';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [thisWeek, setThisWeek] = useState([]);
  const [thisMonth, setThisMonth] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();
  const trendingRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const [wasDragged, setWasDragged] = useState(false);

  const handleTrendingMouseDown = (e) => {
    setIsDragging(true);
    setWasDragged(false);
    setDragStartX(e.pageX - trendingRef.current.offsetLeft);
    setDragScrollLeft(trendingRef.current.scrollLeft);
  };
  const handleTrendingMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - trendingRef.current.offsetLeft;
    const walk = (x - dragStartX) * 2;
    if (Math.abs(walk) > 5) setWasDragged(true);
    trendingRef.current.scrollLeft = dragScrollLeft - walk;
  };
  const handleTrendingMouseUp = () => setIsDragging(false);
  const handleTrendingMouseLeave = () => setIsDragging(false);

  useEffect(() => {
    // Fetch all public events to distribute into categories
    eventApi.getAllPublic().then(res => {
      // res.data is a PageResponse, so we need .content
      const allEvents = res.data?.content || [];
      const now = new Date();

      // Feature 1: Featured events (backend is now Top 10 Trending)
      eventApi.getFeatured().then(fRes => {
        setFeatured(fRes.data || []);
      }).catch(() => { });

      // Filter out events that have passed their endTime
      const activeEvents = allEvents.filter(e => new Date(e.endTime) >= now);

      // Feature 2: Hot this week (next 7 days)
      const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekEvents = activeEvents.filter(e => {
        const d = new Date(e.startTime);
        return d <= weekAhead;
      });
      setThisWeek(weekEvents);

      // Feature 3: Events this month
      const monthEvents = activeEvents.filter(e => {
        const d = new Date(e.startTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      setThisMonth(monthEvents);

    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  // Auto-slide hero
  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featured]);

  const getMinPrice = (event) => {
    return event.minPrice || 0;
  };

  if (loading) return <div className="container section"><div className="spinner" /></div>;

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      {/* Cinematic Hero Carousel */}
      {featured.length > 0 && (
        <section className="hero-carousel fade-in">
          {featured.map((ev, idx) => (
            <div
              key={ev.id}
              className={`hero-slide ${idx === heroIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${ev.bannerUrl || ev.thumbnailUrl || ev.imageUrl})` }}
            >
              <div className="hero-overlay">
                <div className="hero-content-new">
                  <span className="badge" style={{ background: 'var(--accent)', color: 'white', marginBottom: '16px' }}>VÉ BÁN CHẠY</span>
                  <h1>{ev.title}</h1>
                  <p style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.shortDescription || ev.description || 'Sự kiện hấp dẫn đang mở bán vé. Nhanh tay đặt ngay hôm nay!'}
                  </p>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: '30px' }}>
                    <Link to={`/events/${ev.id}`} className="btn btn-primary btn-lg">Mua Vé Ngay</Link>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
                      Từ {formatCurrency(getMinPrice(ev))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="hero-nav">
            {featured.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${idx === heroIndex ? 'active' : ''}`}
                onClick={() => setHeroIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State Fallback */}
      {featured.length === 0 && (
        <section className="container section" style={{ textAlign: 'center' }}>
          <h2>Chào mừng đến với hệ thống đặt vé</h2>
          <p className="text-muted" style={{ marginTop: '10px' }}>Hiện tại chưa có sự kiện nổi bật nào.</p>
        </section>
      )}

      {/* ═══ Trending Ranking ═══ */}
      {featured.length > 0 && (
        <section className="trending-section fade-in">
          <div className="container">
            <div className="trending-header">
              <span className="fire-icon">🔥</span>
              <h2>Sự kiện xu hướng</h2>
            </div>
            <div
              className={`trending-scroll ${isDragging ? 'dragging' : ''}`}
              ref={trendingRef}
              onMouseDown={handleTrendingMouseDown}
              onMouseMove={handleTrendingMouseMove}
              onMouseUp={handleTrendingMouseUp}
              onMouseLeave={handleTrendingMouseLeave}
            >
              {featured.slice(0, 10).map((ev, idx) => (
                <div
                  key={ev.id}
                  className="trending-card"
                  onClick={() => { if (!wasDragged) navigate(`/events/${ev.id}`); }}
                >
                  <span className="trending-rank">{idx + 1}</span>
                  <div className="trending-card-image">
                    <img
                      src={ev.bannerUrl || ev.thumbnailUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
                      alt={ev.title}
                      draggable={false}
                    />
                    <div className="trending-card-overlay">
                      <div className="trending-card-title">{ev.title}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ flex: '0 0 60px' }} />
            </div>
          </div>
        </section>
      )}

      {/* Horizontal Sliders */}
      <EventSlider
        events={featured}
        title="Nổi Bật Nhất"
        subtitle="Những sự kiện được quan tâm nhiều nhất hiện tại"
      />

      <EventSlider
        events={thisWeek}
        title="Hot Trong Tuần"
        subtitle="Sắp diễn ra trong 7 ngày tới, đừng bỏ lỡ!"
      />

      <EventSlider
        events={thisMonth}
        title="Tháng Này Có Gì Vui"
        subtitle="Khám phá các sự kiện bùng nổ trong tháng này"
      />
    </div>
  );
}
