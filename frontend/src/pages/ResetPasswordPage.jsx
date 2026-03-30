import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setLoading(true);

    try {
      const { data } = await authApi.resetPassword({ email, otpCode, newPassword });
      setSuccess(data.message || 'Đặt lại mật khẩu thành công. Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white mb-2">Tạo mật khẩu mới</h2>
          <p className="text-slate-400 text-sm">
            Nhập mã OTP vừa được gửi đến <b>{email}</b> và thiết lập mật khẩu mới.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-500">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex gap-3 text-green-500">
            <FiCheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mã OTP</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-center tracking-[0.5em] text-xl font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-base"
              placeholder="Nhập 6 số"
              maxLength="6"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="••••••••"
              minLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6 || newPassword.length < 6}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Đang cập nhật...' : 'Xác nhận tạo mới'}
          </button>
        </form>
      </div>
    </div>
  );
}
