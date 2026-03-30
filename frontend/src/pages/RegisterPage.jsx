import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      toast.success(data?.message || 'Đăng ký thành công! Vui lòng xác thực email.');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <h1>🎫 Đăng ký</h1>
        <p>Tạo tài khoản để đặt vé sự kiện</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input className="form-input" name="fullName" required value={form.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" name="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="0912345678" />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input className="form-input" type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
