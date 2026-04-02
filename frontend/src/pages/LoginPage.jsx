import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi } from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      
      const pending = sessionStorage.getItem('pendingBooking');
      if (pending) {
        try {
          const bookingData = JSON.parse(pending);
          sessionStorage.removeItem('pendingBooking');
          toast.loading('Đang xử lý đặt vé...', { id: 'booking_process' });
          const res = await bookingApi.create(bookingData);
          toast.success('Đặt vé thành công!', { id: 'booking_process' });
          navigate(`/bookings/${res.data.id}`);
          return;
        } catch (err) {
          toast.error(err.response?.data?.message || 'Đặt vé thất bại, vui lòng thử lại', { id: 'booking_process' });
        }
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <h1>🎫 Đăng nhập</h1>
        <p>Chào mừng bạn quay trở lại EventHub</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="mb-0">Mật khẩu</label>
              <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">Quên mật khẩu?</Link>
            </div>
            <input className="form-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
