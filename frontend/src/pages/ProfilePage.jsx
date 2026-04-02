import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi, uploadApi } from '../services/api';
import { formatDateTime, ROLE_LABELS, ROLE_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlinePencil, HiOutlineShieldCheck, HiOutlineCalendar, HiOutlineCamera } from 'react-icons/hi';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', avatarUrl: '' });
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    userApi.getMe()
      .then(res => {
        setProfileData(res.data);
        setForm({
          fullName: res.data.fullName || '',
          phone: res.data.phone || '',
          avatarUrl: res.data.avatarUrl || '',
        });
      })
      .catch(() => toast.error('Lỗi tải thông tin'))
      .finally(() => setLoadingProfile(false));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    setLoading(true);
    try {
      await userApi.updateProfile(form);
      await refreshUser();
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
      // Reload profile data
      const res = await userApi.getMe();
      setProfileData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const res = await uploadApi.userAvatar(file);
      const newAvatarUrl = res.data.url;
      
      // Update profile with new avatar URL
      await userApi.updateProfile({ ...form, avatarUrl: newAvatarUrl });
      await refreshUser();
      
      // Reload profile data
      const profileRes = await userApi.getMe();
      setProfileData(profileRes.data);
      setForm(prev => ({ ...prev, avatarUrl: profileRes.data.avatarUrl || '' }));
      
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload ảnh thất bại');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const isProfileComplete = profileData?.fullName && profileData?.phone;

  if (loadingProfile) return <div className="auth-page"><div className="spinner" /></div>;

  const avatarUrl = profileData?.avatarUrl;

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '60px' }}>
      <div style={{ width: '100%', maxWidth: 640 }} className="slide-up">
        
        {/* Profile Header Card */}
        <div className="card" style={{ padding: 0, marginBottom: 24, overflow: 'visible', border: 'none', background: 'transparent' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #74b9ff 100%)', 
            borderRadius: '20px 20px 0 0', 
            padding: '40px 32px 60px',
            position: 'relative'
          }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', position: 'absolute', top: 16, left: 24 }}>
              ← Trang chủ
            </Link>
            <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, marginTop: 16 }}>Hồ sơ cá nhân</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', margin: 0 }}>Quản lý thông tin tài khoản của bạn</p>
          </div>

          <div style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 20px 20px', 
            padding: '0 32px 32px', 
            position: 'relative'
          }}>
            {/* Avatar with upload overlay */}
            <div 
              style={{ 
                width: 90, height: 90, borderRadius: '50%', 
                background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '2.2rem', fontWeight: 800, color: '#fff',
                border: '4px solid var(--bg-card)',
                marginTop: -45, marginBottom: 16,
                boxShadow: '0 4px 20px rgba(108, 92, 231, 0.4)',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => avatarInputRef.current?.click()}
              title="Bấm để thay đổi ảnh đại diện"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
                />
              ) : (
                profileData?.fullName?.charAt(0) || '?'
              )}
              
              {/* Camera overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '36px',
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity 0.2s',
                backdropFilter: 'blur(2px)',
              }}>
                {uploadingAvatar ? (
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                ) : (
                  <HiOutlineCamera size={16} color="#fff" />
                )}
              </div>

              <input 
                ref={avatarInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                style={{ display: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>{profileData?.fullName}</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>{profileData?.email}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: ROLE_COLORS[profileData?.role] || '#95a5a6', color: '#fff' }}>
                    {ROLE_LABELS[profileData?.role] || profileData?.role}
                  </span>
                  {!isProfileComplete && (
                    <span className="badge" style={{ background: '#e67e22', color: '#fff' }}>
                      ⚠️ Chưa hoàn thiện
                    </span>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HiOutlinePencil /> Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Warning if profile is incomplete */}
        {!isProfileComplete && !isEditing && (
          <div className="card" style={{ padding: '20px 24px', marginBottom: 24, borderLeft: '4px solid #e67e22', background: 'rgba(230, 126, 34, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Hồ sơ chưa hoàn thiện</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Vui lòng cập nhật đầy đủ <strong>Họ tên</strong> và <strong>Số điện thoại</strong> để có thể đăng ký trở thành Ban tổ chức sự kiện.
                </div>
                <button className="btn btn-sm" style={{ marginTop: 10, background: '#e67e22', color: '#fff', border: 'none' }} onClick={() => setIsEditing(true)}>
                  Cập nhật ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Info / Edit Form */}
        <div className="card" style={{ padding: '32px' }}>
          {isEditing ? (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiOutlinePencil /> Chỉnh sửa thông tin
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiOutlineUser size={16} /> Họ và tên <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    value={form.fullName}
                    onChange={e => setForm({...form, fullName: e.target.value})}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiOutlineMail size={16} /> Email
                  </label>
                  <input
                    className="form-input"
                    value={profileData?.email || ''}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <small style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Email không thể thay đổi</small>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <HiOutlinePhone size={16} /> Số điện thoại <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="0912345678"
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <button type="button" className="btn btn-sm" style={{ background: 'var(--bg-lighter)', color: '#fff', border: 'none' }} onClick={() => { setIsEditing(false); setForm({ fullName: profileData?.fullName || '', phone: profileData?.phone || '', avatarUrl: profileData?.avatarUrl || '' }); }}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                    {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3 style={{ fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiOutlineUser /> Thông tin cá nhân
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { icon: <HiOutlineUser />, label: 'Họ và tên', value: profileData?.fullName, required: true },
                  { icon: <HiOutlineMail />, label: 'Email', value: profileData?.email },
                  { icon: <HiOutlinePhone />, label: 'Số điện thoại', value: profileData?.phone, required: true },
                  { icon: <HiOutlineShieldCheck />, label: 'Vai trò', value: ROLE_LABELS[profileData?.role] || profileData?.role },
                  { icon: <HiOutlineCalendar />, label: 'Ngày tạo tài khoản', value: profileData?.createdAt ? formatDateTime(profileData.createdAt) : '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 16px', background: 'var(--bg-lighter)', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--primary-light)', fontSize: '1.2rem', marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                        {item.value || (
                          <span style={{ color: item.required ? '#e67e22' : 'var(--text-muted)', fontStyle: 'italic' }}>
                            {item.required ? '⚠️ Chưa cung cấp' : 'Chưa cung cấp'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
