import { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { formatDateTime, ROLE_LABELS, ROLE_COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadUsers = () => {
    setLoading(true);
    userApi.getAll({ page, size: 20 })
      .then(res => { setUsers(res.data.content || res.data); setTotalPages(res.data.totalPages || 0); })
      .catch(() => toast.error('Lỗi tải danh sách người dùng'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page]);

  const handleToggleStatus = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn thay đổi trạng thái tài khoản "${name}"?`)) return;
    try {
      await userApi.toggleStatus(id);
      toast.success('Cập nhật trạng thái thành công');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleChangeRole = async (id, role, name) => {
    if (!window.confirm(`Bạn có chắc muốn chuyển vai trò "${name}" thành ${ROLE_LABELS[role]}?`)) return;
    try {
      await userApi.changeRole(id, role);
      toast.success(`Đã chuyển vai trò thành ${ROLE_LABELS[role]}`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1>👥 Quản lý Người dùng</h1>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có người dùng</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: ROLE_COLORS[u.role] || '#95a5a6', color: 'white', fontWeight: 600 }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: u.isActive ? 'var(--success)' : 'var(--danger)', color: 'white' }}>
                        {u.isActive ? '✓ Active' : '✕ Locked'}
                      </span>
                    </td>
                    <td>
                      <div className="actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {/* Role change dropdown */}
                        {u.role !== 'ADMIN' && (
                          <select 
                            value={u.role} 
                            onChange={e => handleChangeRole(u.id, e.target.value, u.fullName)}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
                          >
                            <option value="USER" style={{ background: '#1a1a3e' }}>User</option>
                            <option value="MANAGER" style={{ background: '#1a1a3e' }}>Manager</option>
                            <option value="ADMIN" style={{ background: '#1a1a3e' }}>Admin</option>
                          </select>
                        )}

                        {/* Toggle status */}
                        {u.role !== 'ADMIN' && (
                          <button 
                            className="btn btn-sm" 
                            style={{ background: u.isActive ? '#e74c3c' : '#27ae60', color: '#fff', fontSize: '0.8rem' }} 
                            onClick={() => handleToggleStatus(u.id, u.fullName)}
                          >
                            {u.isActive ? '🔒 Khóa' : '🔓 Mở khóa'}
                          </button>
                        )}

                        {u.role === 'ADMIN' && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '4px 8px' }}>— Quản trị viên</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
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
