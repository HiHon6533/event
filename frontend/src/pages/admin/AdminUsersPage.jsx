import { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getAll({ page: 0, size: 50 })
      .then(res => setUsers(res.data.content || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="admin-header"><h1>👥 Quản lý người dùng</h1></div>

      {loading ? <div className="spinner" /> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    <span className="badge" style={{ background: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--primary)', color: 'white' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: u.isActive ? 'var(--success)' : 'var(--danger)', color: 'white' }}>
                      {u.isActive ? 'Active' : 'Locked'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
