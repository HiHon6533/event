import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminCancellationRequestsPage() {
  const { isAdmin, isManager } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadRequests = () => {
    setLoading(true);
    api.get(`/event-cancellations?status=${statusFilter}`)
      .then(res => setRequests(res.data.content || []))
      .catch(() => toast.error('Lỗi tải danh sách yêu cầu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, [statusFilter]);

  const handleReview = async (id, approved) => {
    const note = prompt(approved ? "Nhập ghi chú cho quản lý (nếu có):" : "Vui lòng nhập lý do từ chối:");
    if (!approved && (!note || note.trim() === '')) {
      toast.error('Phải nhập lý do khi từ chối!');
      return;
    }
    try {
      await api.put(`/event-cancellations/${id}/review?approved=${approved}&note=${note || ''}`);
      toast.success(approved ? 'Đã duyệt yêu cầu' : 'Đã từ chối yêu cầu');
      loadRequests();
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleExecuteRefund = async (id) => {
    if (!window.confirm("Thực hiện hoàn tiền sẽ HỦY sự kiện này và gửi email cho tất cả khách hàng. Bạn có chắc chắn?")) {
      return;
    }
    try {
      await api.post(`/event-cancellations/${id}/execute`);
      toast.success('Đã hoàn tiền và gửi email thành công!');
      loadRequests();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi thực hiện hoàn tiền');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge" style={{ background: '#f39c12', color: '#fff' }}>Chờ duyệt</span>;
      case 'APPROVED': return <span className="badge" style={{ background: '#27ae60', color: '#fff' }}>Đã duyệt</span>;
      case 'REJECTED': return <span className="badge" style={{ background: '#e74c3c', color: '#fff' }}>Từ chối</span>;
      case 'REFUND_COMPLETED': return <span className="badge" style={{ background: '#8e44ad', color: '#fff' }}>Đã hoàn tiền</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1>❌ Yêu cầu Hủy Sự kiện</h1>
        <p style={{ color: 'var(--text-muted)' }}>Quản lý các yêu cầu hủy sự kiện và hoàn tiền từ Ban tổ chức</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('')}>Tất cả</button>
        <button className={`btn ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('PENDING')}>Chờ duyệt</button>
        <button className={`btn ${statusFilter === 'APPROVED' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('APPROVED')}>Đã duyệt</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sự kiện</th>
                  <th>Lý do hủy</th>
                  <th>Số vé / Tiền hoàn</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Không có yêu cầu nào</td></tr>
                ) : requests.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.eventTitle}</td>
                    <td style={{ maxWidth: '250px' }}>{r.reason}</td>
                    <td>
                      <div>{r.totalTicketsSold} vé</div>
                      <div style={{ color: '#e74c3c', fontWeight: 600 }}>{formatCurrency(r.totalRefundAmount)}</div>
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>
                      {r.status === 'PENDING' && isAdmin && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn" style={{ background: '#27ae60', color: '#fff', padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleReview(r.id, true)}>Duyệt</button>
                          <button className="btn" style={{ background: '#e74c3c', color: '#fff', padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handleReview(r.id, false)}>Từ chối</button>
                        </div>
                      )}
                      {r.status === 'APPROVED' && isManager && (
                        <button className="btn" style={{ background: '#8e44ad', color: '#fff', padding: '6px 12px', fontSize: '0.85rem', width: '100%' }} onClick={() => handleExecuteRefund(r.id)}>
                          💸 Xác nhận Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
