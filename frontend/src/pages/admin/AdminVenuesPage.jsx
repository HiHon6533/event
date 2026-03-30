import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { venueApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVenueId, setCurrentVenueId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    totalCapacity: 0,
    imageUrl: '',
    description: ''
  });

  const loadData = () => {
    setLoading(true);
    venueApi.getAll()
      .then(res => setVenues(res.data.content || res.data))
      .catch(() => toast.error('Lỗi tải danh sách địa điểm'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (venue = null) => {
    if (venue) {
      setIsEditMode(true);
      setCurrentVenueId(venue.id);
      setFormData({
        name: venue.name || '',
        address: venue.address || '',
        city: venue.city || '',
        phone: venue.phone || '',
        totalCapacity: venue.totalCapacity || 0,
        imageUrl: venue.imageUrl || '',
        description: venue.description || ''
      });
    } else {
      setIsEditMode(false);
      setCurrentVenueId(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        phone: '',
        totalCapacity: 0,
        imageUrl: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await venueApi.update(currentVenueId, formData);
        toast.success('Cập nhật địa điểm thành công');
      } else {
        await venueApi.create(formData);
        toast.success('Thêm địa điểm thành công');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📍 Quản lý địa điểm</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>+ Thêm địa điểm</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Tên</th><th>Địa chỉ</th><th>Thành phố</th><th>Sức chứa</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {venues.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{v.address}</td>
                  <td>{v.city}</td>
                  <td>{v.totalCapacity}</td>
                  <td>
                    <span className="badge" style={{ background: v.isActive ? 'var(--success)' : 'var(--danger)', color: 'white' }}>
                      {v.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-sm" style={{ background: '#0984e3', color: '#fff'}} onClick={() => openModal(v)}>Sửa</button>
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
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{isEditMode ? 'Sửa địa điểm' : 'Thêm địa điểm mới'}</h2>
              <button style={{ background: 'var(--bg-lighter)', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tên địa điểm</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Địa chỉ (Số nhà, Phường...)</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="form-control" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thành phố / Tỉnh</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sức chứa (Người)</label>
                  <input type="number" value={formData.totalCapacity} onChange={e => setFormData({...formData, totalCapacity: Number(e.target.value)})} min="1" className="form-control" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Số điện thoại (Tuỳ chọn)</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Link Ảnh đại diện tòa nhà</label>
                  <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mô tả thêm</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-control" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white' }} />
              </div>

              <div style={{ padding: '16px 0 0 0', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '10px 20px', background: 'var(--bg-lighter)', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', background: 'var(--primary)', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{isEditMode ? 'Cập nhật' : 'Thêm địa điểm'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
