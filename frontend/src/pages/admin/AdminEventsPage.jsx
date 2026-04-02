import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { eventApi, venueApi, uploadApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminEventsPage() {
  const { isAdmin, isManager } = useAuth();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    venueId: '',
    title: '',
    shortDescription: '',
    description: '',
    category: 'CONCERT',
    startTime: '',
    endTime: '',
    bannerUrl: '',
    thumbnailUrl: '',
    imageUrl: '',
    mapUrl: '',
    organizerName: '',
    organizerDescription: '',
    organizerLogoUrl: '',
    eventAddress: '',
    isFeatured: false
  });

  // File states for upload
  const [bannerFile, setBannerFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [mapFile, setMapFile] = useState(null);
  const [organizerLogoFile, setOrganizerLogoFile] = useState(null);

  // Preview URLs
  const [bannerPreview, setBannerPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [mapPreview, setMapPreview] = useState('');
  const [organizerLogoPreview, setOrganizerLogoPreview] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [evRes, vnRes] = await Promise.all([
        eventApi.getAll({ page: 0, size: 50 }),
        venueApi.getAll()
      ]);
      setEvents(evRes.data.content || evRes.data);
      setVenues(vnRes.data.content || vnRes.data);
    } catch (err) {
      toast.error('Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const formatForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().slice(0, 16);
  };

  const resetFileStates = () => {
    setBannerFile(null); setThumbnailFile(null); setMapFile(null); setOrganizerLogoFile(null);
    setBannerPreview(''); setThumbnailPreview(''); setMapPreview(''); setOrganizerLogoPreview('');
  };

  const openModal = (event = null) => {
    resetFileStates();
    if (event) {
      setIsEditMode(true);
      setCurrentEventId(event.id);
      setFormData({
        venueId: event.venueId || event.venue?.id || '',
        title: event.title || '',
        shortDescription: event.shortDescription || '',
        description: event.description || '',
        category: event.category || 'CONCERT',
        startTime: formatForInput(event.startTime),
        endTime: formatForInput(event.endTime),
        bannerUrl: event.bannerUrl || '',
        thumbnailUrl: event.thumbnailUrl || '',
        imageUrl: event.imageUrl || '',
        mapUrl: event.mapUrl || '',
        organizerName: event.organizerName || '',
        organizerDescription: event.organizerDescription || '',
        organizerLogoUrl: event.organizerLogoUrl || '',
        eventAddress: event.eventAddress || '',
        isFeatured: event.isFeatured || false
      });
      // Set existing image previews
      if (event.bannerUrl) setBannerPreview(event.bannerUrl);
      if (event.thumbnailUrl) setThumbnailPreview(event.thumbnailUrl);
      if (event.mapUrl) setMapPreview(event.mapUrl);
      if (event.organizerLogoUrl) setOrganizerLogoPreview(event.organizerLogoUrl);
    } else {
      setIsEditMode(false);
      setCurrentEventId(null);
      setFormData({
        venueId: venues.length > 0 ? venues[0].id : '',
        title: '',
        shortDescription: '',
        description: '',
        category: 'CONCERT',
        startTime: '',
        endTime: '',
        bannerUrl: '',
        thumbnailUrl: '',
        imageUrl: '',
        mapUrl: '',
        organizerName: '',
        organizerDescription: '',
        organizerLogoUrl: '',
        eventAddress: '',
        isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    switch (type) {
      case 'banner':
        setBannerFile(file); setBannerPreview(previewUrl);
        break;
      case 'thumbnail':
        setThumbnailFile(file); setThumbnailPreview(previewUrl);
        break;
      case 'map':
        setMapFile(file); setMapPreview(previewUrl);
        break;
      case 'organizerLogo':
        setOrganizerLogoFile(file); setOrganizerLogoPreview(previewUrl);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let eventId = currentEventId;

      if (isEditMode) {
        await eventApi.update(currentEventId, formData);
        toast.success('Cập nhật sự kiện thành công');
      } else {
        const res = await eventApi.create(formData);
        eventId = res.data.id;
        toast.success(isManager ? 'Tạo sự kiện thành công! Đang chờ Admin duyệt.' : 'Tạo sự kiện thành công');
      }

      // Upload files if selected
      const uploadPromises = [];
      if (bannerFile) uploadPromises.push(uploadApi.eventBanner(eventId, bannerFile));
      if (thumbnailFile) uploadPromises.push(uploadApi.eventThumbnail(eventId, thumbnailFile));
      if (mapFile) uploadPromises.push(uploadApi.eventMap(eventId, mapFile));
      if (organizerLogoFile) uploadPromises.push(uploadApi.eventOrganizerLogo(eventId, organizerLogoFile));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast.success('Upload ảnh thành công!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    const messages = {
      PUBLISHED: 'Bạn có chắc chắn xuất bản sự kiện này?',
      CANCELLED: 'Bạn có chắc chắn hủy sự kiện này? Người đã đặt vé sẽ nhận email thông báo.',
      DRAFT: 'Chuyển sự kiện về trạng thái nháp?',
    };
    try {
      if (window.confirm(messages[status] || 'Bạn có chắc chắn?')) {
        await eventApi.updateStatus(id, status);
        toast.success('Cập nhật trạng thái thành công');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  // Determine which status actions are available based on role and current status
  const getStatusActions = (event) => {
    const actions = [];
    
    if (isAdmin) {
      if (event.status === 'DRAFT' || event.status === 'PENDING_REVIEW') {
        actions.push({ label: '✅ Duyệt & Xuất bản', status: 'PUBLISHED', color: '#27ae60' });
      }
      if (event.status === 'PUBLISHED') {
        actions.push({ label: '❌ Hủy sự kiện', status: 'CANCELLED', color: '#e74c3c' });
      }
      if (event.status === 'PENDING_REVIEW') {
        actions.push({ label: '↩ Trả về nháp', status: 'DRAFT', color: '#95a5a6' });
      }
    }
    
    if (isManager) {
      if (event.status === 'DRAFT' || event.status === 'PENDING_REVIEW') {
        actions.push({ label: '❌ Hủy', status: 'CANCELLED', color: '#e74c3c' });
      }
    }
    
    return actions;
  };

  // Shared input styles
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white', fontSize: '0.9rem' };
  const textareaStyle = { ...inputStyle, resize: 'vertical', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 };
  const selectStyle = { ...inputStyle, background: 'var(--bg-card)' };

  const ImageUploadField = ({ label, preview, existingUrl, onChange, hint }) => (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{
        border: '2px dashed var(--border)', borderRadius: '12px', padding: '12px',
        textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
        background: preview ? 'rgba(108, 92, 231, 0.05)' : 'transparent',
        position: 'relative', minHeight: 100, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
        onClick={() => document.getElementById(`file-${label}`)?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onChange({ target: { files: [f] } }); }}
      >
        <input id={`file-${label}`} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
        {preview ? (
          <img src={preview} alt="Preview" style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
        ) : (
          <>
            <span style={{ fontSize: '1.8rem', opacity: 0.5 }}>📷</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kéo thả hoặc click để chọn ảnh</span>
          </>
        )}
        {hint && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</span>}
      </div>
    </div>
  );

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📅 {isManager ? 'Sự kiện của tôi' : 'Quản lý Sự kiện'}</h1>
          {isManager && <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>Sự kiện bạn tạo sẽ được Admin duyệt trước khi xuất bản</p>}
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Tạo sự kiện</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Tên sự kiện</th><th>Thể loại</th>
                {isAdmin && <th>Ban tổ chức</th>}
                <th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {isManager ? 'Bạn chưa tạo sự kiện nào' : 'Chưa có sự kiện nào'}
                </td></tr>
              ) : events.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td style={{ fontWeight: 600, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</td>
                  <td>{CATEGORY_LABELS[e.category] || e.category}</td>
                  {isAdmin && (
                    <td>
                      {e.organizerName ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🏢 {e.organizerName}</span>
                      ) : e.managerName ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>👤 {e.managerName}</span>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>— Admin</span>
                      )}
                    </td>
                  )}
                  <td style={{ fontSize: '0.85rem' }}>{formatDateTime(e.startTime)}</td>
                  <td>
                    <span className="badge" style={{ background: STATUS_COLORS[e.status] || '#95a5a6', color: 'white' }}>
                      {STATUS_LABELS[e.status] || e.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Edit: only for DRAFT/PENDING_REVIEW */}
                      {(e.status === 'DRAFT' || e.status === 'PENDING_REVIEW') && (
                        <button className="btn btn-sm" style={{ background: '#0984e3', color: '#fff'}} onClick={() => openModal(e)}>Sửa</button>
                      )}
                      
                      {getStatusActions(e).map((action, idx) => (
                        <button key={idx} className="btn btn-sm" style={{ background: action.color, color: '#fff' }} onClick={() => handleStatusChange(e.id, action.status)}>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', width: '90%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10, borderRadius: '16px 16px 0 0' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{isEditMode ? '✏️ Sửa sự kiện' : '🎉 Tạo sự kiện mới'}</h2>
                {isManager && !isEditMode && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#e67e22' }}>⏳ Sự kiện sẽ ở trạng thái "Chờ duyệt" sau khi tạo</p>}
              </div>
              <button style={{ background: 'var(--bg-lighter)', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* ── Section 1: Thông tin cơ bản ── */}
              <div style={{ padding: '16px', background: 'rgba(108, 92, 231, 0.06)', borderRadius: '12px', border: '1px solid rgba(108, 92, 231, 0.15)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: 'var(--primary-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>📋 Thông tin cơ bản</h3>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Tên sự kiện <span style={{ color: '#e74c3c' }}>*</span></label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={inputStyle} placeholder="Nhập tên sự kiện..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
                  <div className="form-group">
                    <label style={labelStyle}>Thể loại <span style={{ color: '#e74c3c' }}>*</span></label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required style={selectStyle}>
                      {Object.entries(CATEGORY_LABELS).map(([key, val]) => <option key={key} value={key} style={{ background: 'var(--bg-card)', color: 'white' }}>{val}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Địa điểm tổ chức <span style={{ color: '#e74c3c' }}>*</span></label>
                    <select value={formData.venueId} onChange={e => setFormData({...formData, venueId: e.target.value})} required style={selectStyle}>
                      {venues.map(v => <option key={v.id} value={v.id} style={{ background: 'var(--bg-card)', color: 'white' }}>{v.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>📍 Địa chỉ sự kiện chi tiết</label>
                  <input type="text" value={formData.eventAddress} onChange={e => setFormData({...formData, eventAddress: e.target.value})} style={inputStyle} placeholder="VD: Sảnh A, Tầng 3 - Nhà Văn Hóa Thanh Niên, Quận 1, TP.HCM" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Thời gian bắt đầu <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required style={inputStyle} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Thời gian kết thúc <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* ── Section 2: Mô tả sự kiện ── */}
              <div style={{ padding: '16px', background: 'rgba(0, 184, 148, 0.06)', borderRadius: '12px', border: '1px solid rgba(0, 184, 148, 0.15)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: '#00b894', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>📝 Thông tin sự kiện</h3>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Mô tả ngắn gọn</label>
                  <textarea rows="2" value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} style={textareaStyle} placeholder="Mô tả ngắn hiển thị trên card sự kiện..." />
                </div>

                <div className="form-group">
                  <label style={labelStyle}>Mô tả chi tiết</label>
                  <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={textareaStyle} placeholder="Nội dung chi tiết về sự kiện, chương trình, đối tượng..." />
                </div>
              </div>

              {/* ── Section 3: Hình ảnh sự kiện ── */}
              <div style={{ padding: '16px', background: 'rgba(9, 132, 227, 0.06)', borderRadius: '12px', border: '1px solid rgba(9, 132, 227, 0.15)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: '#0984e3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>🖼️ Hình ảnh sự kiện</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
                  <ImageUploadField 
                    label="Ảnh Banner (Lớn)" 
                    preview={bannerPreview} 
                    onChange={e => handleFileSelect(e, 'banner')} 
                    hint="1200×400px khuyến nghị" 
                  />
                  <ImageUploadField 
                    label="Ảnh Thumbnail (Nhỏ)" 
                    preview={thumbnailPreview} 
                    onChange={e => handleFileSelect(e, 'thumbnail')} 
                    hint="400×300px khuyến nghị" 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <ImageUploadField 
                    label="Sơ đồ chỗ ngồi / Map" 
                    preview={mapPreview} 
                    onChange={e => handleFileSelect(e, 'map')} 
                    hint="Ảnh sơ đồ venue/chỗ ngồi (tuỳ chọn)" 
                  />
                </div>
              </div>

              {/* ── Section 4: Thông tin Ban tổ chức ── */}
              <div style={{ padding: '16px', background: 'rgba(253, 203, 110, 0.08)', borderRadius: '12px', border: '1px solid rgba(253, 203, 110, 0.2)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', color: '#fdcb6e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>🏢 Thông tin Ban tổ chức</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
                  <div className="form-group">
                    <label style={labelStyle}>Tên Ban tổ chức</label>
                    <input type="text" value={formData.organizerName} onChange={e => setFormData({...formData, organizerName: e.target.value})} style={inputStyle} placeholder="VD: Công ty ABC Entertainment" />
                  </div>
                  <ImageUploadField 
                    label="Logo Ban tổ chức" 
                    preview={organizerLogoPreview} 
                    onChange={e => handleFileSelect(e, 'organizerLogo')} 
                    hint="Logo 200×200px" 
                  />
                </div>

                <div className="form-group">
                  <label style={labelStyle}>Thông tin Ban tổ chức</label>
                  <textarea rows="3" value={formData.organizerDescription} onChange={e => setFormData({...formData, organizerDescription: e.target.value})} style={textareaStyle} placeholder="Giới thiệu về ban tổ chức, kinh nghiệm, liên hệ..." />
                </div>
              </div>

              {/* Featured checkbox: Admin only */}
              {isAdmin && (
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label htmlFor="isFeatured" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Đánh dấu là "Sự kiện nổi bật" (🔥 Hot)</label>
                </div>
              )}

              <div style={{ padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px', background: 'var(--bg-lighter)', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} disabled={submitting}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', background: 'var(--primary)', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                  {submitting ? '⏳ Đang xử lý...' : isEditMode ? '💾 Lưu thay đổi' : '🚀 Tạo sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
