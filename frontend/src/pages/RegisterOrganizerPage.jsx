import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { organizerApi, userApi } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineOfficeBuilding, HiOutlinePhone, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi';

export default function RegisterOrganizerPage() {
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ organizationName: '', description: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/register-organizer' } });
      return;
    }
    if (isManager || isAdmin) {
      navigate('/admin/events');
      return;
    }

    // Check profile completeness + existing request
    Promise.all([
      userApi.getMe(),
      organizerApi.getMyStatus().catch(() => ({ data: null })),
    ]).then(([profileRes, statusRes]) => {
      const profile = profileRes.data;
      // Check if profile is complete (has fullName and phone)
      if (!profile.fullName || !profile.phone) {
        setProfileIncomplete(true);
      }
      setExistingRequest(statusRes.data);
    }).catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, [user, isManager, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await organizerApi.register(form);
      toast.success(res.data.message);
      setExistingRequest({ status: 'PENDING', organizationName: form.organizationName });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) return <div className="auth-page"><div className="spinner" /></div>;

  // Profile is missing required info → redirect to profile first
  if (profileIncomplete) {
    return (
      <div className="auth-page">
        <div className="auth-card slide-up" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: 12 }}>Vui lòng hoàn thiện Hồ sơ</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
            Để đăng ký trở thành Ban tổ chức sự kiện, bạn cần cung cấp đầy đủ thông tin cá nhân trước:
          </p>
          <div style={{ textAlign: 'left', padding: '16px 20px', background: 'var(--bg-lighter)', borderRadius: '12px', marginBottom: 24, borderLeft: '4px solid #e67e22' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiOutlineExclamation color="#e67e22" />
                <span><strong>Họ và tên</strong> — bắt buộc</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiOutlineExclamation color="#e67e22" />
                <span><strong>Số điện thoại</strong> — bắt buộc</span>
              </div>
            </div>
          </div>
          <Link to="/profile" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            ✏️ Cập nhật Hồ sơ ngay
          </Link>
          <div className="auth-footer" style={{ marginTop: 16 }}>
            <Link to="/">← Quay lại Trang chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  // Already have a pending request
  if (existingRequest) {
    return (
      <div className="auth-page">
        <div className="auth-card slide-up" style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>
            {existingRequest.status === 'PENDING' ? '⏳' : existingRequest.status === 'APPROVED' ? '🎉' : '😞'}
          </div>
          <h1 style={{ fontSize: '1.5rem' }}>
            {existingRequest.status === 'PENDING' && 'Yêu cầu đang chờ duyệt'}
            {existingRequest.status === 'APPROVED' && 'Đã được duyệt!'}
            {existingRequest.status === 'REJECTED' && 'Yêu cầu bị từ chối'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {existingRequest.status === 'PENDING' && (
              <>Yêu cầu đăng ký Ban tổ chức <strong>"{existingRequest.organizationName}"</strong> đã được gửi và đang chờ Admin xem xét. Bạn sẽ nhận được kết quả sớm nhất.</>
            )}
            {existingRequest.status === 'APPROVED' && 'Chúc mừng! Bạn đã trở thành Ban tổ chức sự kiện. Bắt đầu tạo sự kiện ngay!'}
            {existingRequest.status === 'REJECTED' && 'Rất tiếc, yêu cầu của bạn chưa được chấp thuận. Bạn có thể đăng ký lại.'}
          </p>

          {existingRequest.adminNote && (
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-lighter)', borderRadius: '8px', borderLeft: '3px solid #e74c3c', textAlign: 'left', fontSize: '0.9rem' }}>
              <strong style={{ color: '#e74c3c' }}>Ghi chú từ Admin:</strong> {existingRequest.adminNote}
            </div>
          )}

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-outline btn-sm">← Trang chủ</Link>
            {existingRequest.status === 'APPROVED' && <Link to="/admin/events" className="btn btn-primary btn-sm">🚀 Tạo sự kiện</Link>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card slide-up" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>🏢</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Đăng ký Ban tổ chức sự kiện</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Trở thành Ban tổ chức để tạo và quản lý sự kiện trên EventHub. 
            Yêu cầu của bạn sẽ được Admin duyệt trong thời gian sớm nhất.
          </p>
        </div>

        {/* Steps info */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { icon: <HiOutlineDocumentText />, text: 'Điền thông tin' },
            { icon: <HiOutlineClock />, text: 'Chờ duyệt' },
            { icon: <HiOutlineCheckCircle />, text: 'Bắt đầu tạo sự kiện' },
          ].map((step, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: 'var(--bg-lighter)', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.2rem', color: 'var(--primary-light)', marginBottom: 4 }}>{step.icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOutlineOfficeBuilding /> Tên tổ chức / Đơn vị *</label>
            <input 
              className="form-input" 
              name="organizationName" 
              required 
              value={form.organizationName} 
              onChange={e => setForm({...form, organizationName: e.target.value})} 
              placeholder="VD: Công ty TNHH Sự kiện ABC"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOutlinePhone /> Số điện thoại liên hệ</label>
            <input 
              className="form-input" 
              name="phone" 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})} 
              placeholder="0912345678"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOutlineDocumentText /> Mô tả hoạt động</label>
            <textarea 
              className="form-input" 
              name="description" 
              rows={4}
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              placeholder="Mô tả ngắn về tổ chức và kinh nghiệm tổ chức sự kiện của bạn..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
            {loading ? 'Đang gửi...' : '📤 Gửi yêu cầu đăng ký'}
          </button>
        </form>
        <div className="auth-footer" style={{ marginTop: 16 }}>
          <Link to="/">← Quay lại Trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
