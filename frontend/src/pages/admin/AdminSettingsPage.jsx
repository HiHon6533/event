import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit states
  const [editValues, setEditValues] = useState({});

  const loadData = () => {
    setLoading(true);
    api.get('/configs')
      .then(res => {
        setConfigs(res.data);
        const vals = {};
        res.data.forEach(c => vals[c.configKey] = c.configValue);
        setEditValues(vals);
      })
      .catch(() => toast.error('Lỗi tải cấu hình'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async (key) => {
    setSaving(true);
    try {
      await api.put(`/configs/${key}`, { value: editValues[key] });
      toast.success('Đã lưu cấu hình thành công!');
      loadData();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1>⚙️ Cấu hình Hệ thống</h1>
        <p style={{ color: 'var(--text-muted)' }}>Thay đổi thông số phí dịch vụ và hoa hồng nền tảng</p>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
          {configs.map(c => (
            <div key={c.configKey} className="card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                  {c.configKey === 'SERVICE_FEE' ? 'Phí dịch vụ thu người dùng (VNĐ/vé)' : 'Phí Hoa hồng thu Ban tổ chức (%)'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mã cấu hình: <code>{c.configKey}</code></div>
                <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>{c.description}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '200px' }}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={editValues[c.configKey] || ''} 
                    onChange={e => setEditValues({ ...editValues, [c.configKey]: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: '#fff', fontSize: '1.1rem', fontWeight: 600, textAlign: 'right' }}
                  />
                  {c.configKey === 'COMMISSION_RATE' && <span style={{ position: 'absolute', right: '16px', top: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>%</span>}
                  {c.configKey === 'SERVICE_FEE' && <span style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>VNĐ</span>}
                </div>
                
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={saving || editValues[c.configKey] === c.configValue}
                  onClick={() => handleSave(c.configKey)}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
