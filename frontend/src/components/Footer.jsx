import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>🎫 <span>EventHub</span></h3>
            <p>Nền tảng đặt vé sự kiện hàng đầu Việt Nam. Khám phá và đặt vé cho hàng ngàn sự kiện hấp dẫn.</p>
          </div>
          <div className="footer-col">
            <h4>Sự kiện</h4>
            <Link to="/events?category=CONCERT">Hòa nhạc</Link>
            <Link to="/events?category=THEATER">Kịch</Link>
            <Link to="/events?category=FESTIVAL">Lễ hội</Link>
            <Link to="/events?category=CONFERENCE">Hội nghị</Link>
          </div>
          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <a href="#">Trung tâm trợ giúp</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
          </div>
          <div className="footer-col">
            <h4>Liên hệ</h4>
            <a href="#">support@eventhub.vn</a>
            <a href="#">1900-xxxx</a>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 EventHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
