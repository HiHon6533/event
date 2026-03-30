import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../services/api';
import EventCard from '../components/EventCard';
import { HiOutlineSearch, HiOutlineTicket, HiOutlineStar, HiOutlineGlobe } from 'react-icons/hi';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventApi.getFeatured().then(res => setFeatured(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>
              Khám phá & Đặt vé<br />
              <span className="gradient-text">Sự kiện hàng đầu</span>
            </h1>
            <p>
              Nền tảng đặt vé sự kiện số 1 Việt Nam. Hàng ngàn sự kiện hấp dẫn từ
              hòa nhạc, kịch, hội nghị đến lễ hội đang chờ bạn.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/events" className="btn btn-primary btn-lg">
                <HiOutlineSearch /> Khám phá ngay
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">Đăng ký miễn phí</Link>
            </div>
            <div className="hero-stats">
              <div><div className="hero-stat-value">1000+</div><div className="hero-stat-label">Sự kiện</div></div>
              <div><div className="hero-stat-value">50K+</div><div className="hero-stat-label">Khách hàng</div></div>
              <div><div className="hero-stat-value">100+</div><div className="hero-stat-label">Địa điểm</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">🔥 Sự kiện nổi bật</h2>
          <p className="section-subtitle">Đừng bỏ lỡ những sự kiện hot nhất!</p>
          {loading ? <div className="spinner" /> : (
            <div className="grid grid-3">
              {featured.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          )}
          {!loading && featured.length === 0 && (
            <div className="empty-state"><p>Chưa có sự kiện nổi bật nào</p></div>
          )}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/events" className="btn btn-outline">Xem tất cả sự kiện →</Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="section" style={{ background: 'var(--bg-card)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Tại sao chọn EventHub?</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Trải nghiệm đặt vé tốt nhất</p>
          <div className="grid grid-3">
            {[
              { icon: <HiOutlineTicket size={32} />, title: 'Đặt vé dễ dàng', desc: 'Giao diện trực quan, đặt vé chỉ trong vài bước đơn giản' },
              { icon: <HiOutlineStar size={32} />, title: 'Sự kiện chất lượng', desc: 'Hợp tác với các đơn vị tổ chức uy tín trên toàn quốc' },
              { icon: <HiOutlineGlobe size={32} />, title: 'Mọi lúc mọi nơi', desc: 'Truy cập và quản lý vé của bạn trên mọi thiết bị' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ color: 'var(--primary-light)', marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
