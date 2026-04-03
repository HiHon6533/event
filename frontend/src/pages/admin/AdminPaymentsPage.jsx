import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = () => {
    setLoading(true);
    api.get('/payment/all')
      .then(res => setPayments(res.data.content || []))
      .catch(() => toast.error('Lỗi tải danh sách thanh toán'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPayments(); }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS': return <span className="badge" style={{ background: '#27ae60', color: '#fff' }}>Thành công</span>;
      case 'PENDING': return <span className="badge" style={{ background: '#f39c12', color: '#fff' }}>Chờ TT</span>;
      case 'FAILED': return <span className="badge" style={{ background: '#e74c3c', color: '#fff' }}>Thất bại</span>;
      case 'REFUNDED': return <span className="badge" style={{ background: '#8e44ad', color: '#fff' }}>Đã hoàn tiền</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1>💳 Quản lý Thanh toán & Giao dịch</h1>
        <p style={{ color: 'var(--text-muted)' }}>Xem lịch sử giao dịch và dòng tiền hệ thống</p>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Giao dịch</th>
                  <th>Mã Đơn vé</th>
                  <th>Phương thức</th>
                  <th>Số tiền</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Chưa có giao dịch nào</td></tr>
                ) : payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.transactionId || 'N/A'}</td>
                    <td>{p.bookingCode}</td>
                    <td>
                      <span style={{ padding: '4px 8px', background: 'var(--bg-lighter)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                    <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString('vi-VN') : 'N/A'}</td>
                    <td>{getStatusBadge(p.status)}</td>
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
