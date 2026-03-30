import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { eventApi, venueApi } from '../../services/api';
import { formatDateTime, CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [formData, setFormData] = useState({
    venueId: '',
    title: '',
    shortDescription: '',
    description: '',
    category: 'MUSIC',
    startTime: '',
    endTime: '',
    bannerUrl: '',
    thumbnailUrl: '',
    isFeatured: false
  });

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

  const openModal = (event = null) => {
    if (event) {
      setIsEditMode(true);
      setCurrentEventId(event.id);
      setFormData({
        venueId: event.venue?.id || '',
        title: event.title || '',
        shortDescription: event.shortDescription || '',
        description: event.description || '',
        category: event.category || 'MUSIC',
        startTime: formatForInput(event.startTime),
        endTime: formatForInput(event.endTime),
        bannerUrl: event.bannerUrl || '',
        thumbnailUrl: event.thumbnailUrl || '',
        isFeatured: event.isFeatured || false
      });
    } else {
      setIsEditMode(false);
      setCurrentEventId(null);
      setFormData({
        venueId: venues.length > 0 ? venues[0].id : '',
        title: '',
        shortDescription: '',
        description: '',
        category: 'MUSIC',
        startTime: '',
        endTime: '',
        bannerUrl: '',
        thumbnailUrl: '',
        isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await eventApi.update(currentEventId, formData);
        toast.success('Cập nhật sự kiện thành công');
      } else {
        await eventApi.create(formData);
        toast.success('Tạo sự kiện thành công');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      if (window.confirm('Bạn có chắc chắn chuyển trạng thái sự kiện này?')) {
        await eventApi.updateStatus(id, status);
        toast.success('Cập nhật trạng thái thành công');
        loadData();
      }
    } catch (err) {
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📅 Quản lý sự kiện</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Tạo sự kiện</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Tên sự kiện</th><th>Thể loại</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td style={{ fontWeight: 600, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</td>
                  <td>{CATEGORY_LABELS[e.category] || e.category}</td>
                  <td style={{ fontSize: '0.85rem' }}>{formatDateTime(e.startTime)}</td>
                  <td>
                    <span className="badge" style={{ background: STATUS_COLORS[e.status] || '#95a5a6', color: 'white' }}>
                      {STATUS_LABELS[e.status] || e.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-sm" style={{ background: '#0984e3', color: '#fff'}} onClick={() => openModal(e)}>Sửa</button>
                      
                      {e.status === 'DRAFT' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(e.id, 'PUBLISHED')}>Xuất bản</button>
                      )}
                      {e.status === 'PUBLISHED' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(e.id, 'CANCELLED')}>Hủy</button>
                      )}
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
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{isEditMode ? 'Sửa sự kiện' : 'Tạo sự kiện mới'}</h2>
              <button style={{ background: 'var(--bg-lighter)', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên sự kiện</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thể loại</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="form-control" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }}>
                    {Object.entries(CATEGORY_LABELS).map(([key, val]) => <option key={key} value={key} style={{ background: 'var(--bg-card)', color: 'white' }}>{val}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Địa điểm tổ chức</label>
                  <select value={formData.venueId} onChange={e => setFormData({...formData, venueId: e.target.value})} className="form-control" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white' }}>
                    {venues.map(v => <option key={v.id} value={v.id} style={{ background: 'var(--bg-card)', color: 'white' }}>{v.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thời gian bắt đầu</label>
                  <input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="form-control" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thời gian kết thúc</label>
                  <input type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="form-control" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mô tả ngắn gọn</label>
                <textarea rows="2" value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mô tả chi tiết</label>
                <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Link Ảnh Thumbnail (Nhỏ)</label>
                  <input type="url" value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Link Ảnh Banner (Lớn)</label>
                  <input type="url" value={formData.bannerUrl} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
              </div>

              <div style={{ padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px', background: 'var(--bg-lighter)', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', background: 'var(--primary)', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{isEditMode ? 'Lưu thay đổi' : 'Tạo sự kiện'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
