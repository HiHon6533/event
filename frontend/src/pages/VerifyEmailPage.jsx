import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await authApi.verifyEmail({ email, otpCode });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setMessage('');
    try {
      const { data } = await authApi.resendOtp({ email });
      setMessage(data.message || 'OTP đã được gửi lại!');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gửi lại OTP');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FiMail style={{ width: 32, height: 32, color: 'var(--primary-light)' }} />
          </div>
          <h1>Xác thực Email</h1>
          <p>
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến<br />
            <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '0.75rem', color: 'var(--danger)', alignItems: 'center' }}>
            <FiAlertCircle size={20} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {message && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', gap: '0.75rem', color: 'var(--success)', alignItems: 'center' }}>
            <FiCheckCircle size={20} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mã OTP</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="form-input"
              style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 'bold' }}
              placeholder="Nhập 6 số"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          Chưa nhận được mã?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'bold' }}
          >
            {resending ? 'Đang gửi...' : 'Gửi lại OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
