import { useState, useEffect } from 'react';
import { organizerApi } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  PENDING: { label: '⏳ Chờ duyệt', color: '#e67e22' },
  APPROVED: { label: '✅ Đã duyệt', color: '#27ae60' },
  REJECTED: { label: '❌ Từ chối', color: '#e74c3c' },
};

export default function AdminOrganizerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadData = () => {
    setLoading(true);
    organizerApi.getRequests({ page, size: 20, status: filter || undefined })
      .then(res => { setRequests(res.data.content || []); setTotalPages(res.data.totalPages || 0); })
      .catch(() => toast.error('Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page, filter]);

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Duyệt yêu cầu của "${name}"? Người dùng sẽ được nâng cấp thành Ban tổ chức.`)) return;
    try {
      const res = await organizerApi.approve(id);
      toast.success(res.data.message);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleReject = async (id, name) => {
    const note = window.prompt(`Lý do từ chối yêu cầu của "${name}" (tùy chọn):`);
    if (note === null) return; // User cancelled prompt
    try {
      const res = await organizerApi.reject(id, note);
      toast.success(res.data.message);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>📋 Duyệt Ban tổ chức</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>Quản lý yêu cầu đăng ký trở thành Ban tổ chức sự kiện</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button 
              key={f} 
              className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`} 
              style={{ background: filter === f ? 'var(--primary)' : 'var(--bg-lighter)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
              onClick={() => { setFilter(f); setPage(0); }}
            >
              {f === '' ? 'Tất cả' : STATUS_MAP[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {requests.length === 0 ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
              <p>Chưa có yêu cầu nào {filter && `với trạng thái "${STATUS_MAP[filter]?.label || filter}"`}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {requests.map(req => (
                <div key={req.id} className="card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 250 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #2980b9, #3498db)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {req.userFullName?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1rem' }}>{req.userFullName}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{req.userEmail}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Tổ chức:</span>
                        <span style={{ fontWeight: 600 }}>{req.organizationName}</span>
                        
                        {req.phone && <>
                          <span style={{ color: 'var(--text-muted)' }}>SĐT:</span>
                          <span>{req.phone}</span>
                        </>}
                        
                        {req.description && <>
                          <span style={{ color: 'var(--text-muted)' }}>Mô tả:</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{req.description}</span>
                        </>}

                        <span style={{ color: 'var(--text-muted)' }}>Ngày gửi:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{formatDateTime(req.createdAt)}</span>
                      </div>

                      {req.adminNote && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-lighter)', borderRadius: '8px', borderLeft: '3px solid #e74c3c', fontSize: '0.85rem' }}>
                          <strong style={{ color: '#e74c3c' }}>Lý do từ chối:</strong> {req.adminNote}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span className="badge" style={{ background: STATUS_MAP[req.status]?.color || '#95a5a6', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                        {STATUS_MAP[req.status]?.label || req.status}
                      </span>

                      {req.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="btn btn-sm" style={{ background: '#27ae60', color: '#fff', padding: '8px 16px' }} onClick={() => handleApprove(req.id, req.userFullName)}>
                            ✅ Duyệt
                          </button>
                          <button className="btn btn-sm" style={{ background: '#e74c3c', color: '#fff', padding: '8px 16px' }} onClick={() => handleReject(req.id, req.userFullName)}>
                            ❌ Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: 16 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === page ? 'active' : ''} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
