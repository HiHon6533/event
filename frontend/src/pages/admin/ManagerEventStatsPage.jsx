import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventApi } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e67e22', '#e84393'];

export default function ManagerEventStatsPage() {
  const { eventId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview | attendees

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    eventApi.getStats(eventId)
      .then(res => setStats(res.data))
      .catch(() => toast.error('Lỗi tải thống kê sự kiện'))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="spinner" />;
  if (!stats) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 60 }}>Không tìm thấy dữ liệu</div>;

  const soldRate = stats.totalTicketsAvailable > 0
    ? ((stats.totalTicketsSold / stats.totalTicketsAvailable) * 100).toFixed(1)
    : 0;

  const filteredAttendees = stats.attendees?.filter(a =>
    !searchTerm ||
    a.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const chartData = stats.ticketBreakdown?.map(t => ({
    name: t.ticketName,
    sold: t.soldQuantity,
    remaining: t.remainingQuantity,
    revenue: Number(t.revenue),
  })) || [];

  const cardStyle = {
    background: 'var(--bg-card)', borderRadius: 16, padding: '28px 24px',
    border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
  };
  const statNumber = { fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 };
  const statLabel = { fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 };
  const tabBtn = (active) => ({
    padding: '12px 28px', background: active ? 'rgba(216,27,46,0.15)' : 'transparent',
    color: active ? '#ff6b6b' : 'var(--text-secondary)', border: 'none',
    borderBottom: active ? '3px solid #ff6b6b' : '3px solid transparent',
    fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s'
  });

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Link to="/admin/events" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4, display: 'block' }}>← Quay lại danh sách</Link>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>📊 Thống kê: {stats.eventTitle}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ ...cardStyle, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 120 }}>
            <span style={{ fontSize: '1.5rem' }}>🎟️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ff6b6b' }}>{stats.totalTicketsSold}/{stats.totalTicketsAvailable}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vé đã bán</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '2rem', opacity: 0.12 }}>💰</div>
          <div style={{ ...statNumber, color: '#ffeaa7' }}>{formatCurrency(stats.totalRevenue)}</div>
          <div style={statLabel}>Doanh thu sự kiện</div>
        </div>
        <div style={cardStyle}>
          <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '2rem', opacity: 0.12 }}>🎫</div>
          <div style={{ ...statNumber, color: '#74b9ff' }}>{stats.totalTicketsSold}</div>
          <div style={statLabel}>Vé đã bán</div>
        </div>
        <div style={cardStyle}>
          <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '2rem', opacity: 0.12 }}>📈</div>
          <div style={{ ...statNumber, color: soldRate >= 80 ? '#00b894' : soldRate >= 50 ? '#fdcb6e' : '#e17055' }}>{soldRate}%</div>
          <div style={statLabel}>Tỷ lệ bán vé</div>
        </div>
        <div style={cardStyle}>
          <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '2rem', opacity: 0.12 }}>✅</div>
          <div style={{ ...statNumber, color: stats.attendanceRate >= 70 ? '#00b894' : '#fdcb6e' }}>{stats.attendanceRate.toFixed(1)}%</div>
          <div style={statLabel}>Tỷ lệ tham dự ({stats.totalCheckedIn} check-in)</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        <button style={tabBtn(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>📊 Tổng quan hạng vé</button>
        <button style={tabBtn(activeTab === 'attendees')} onClick={() => setActiveTab('attendees')}>👥 Danh sách người tham gia ({stats.attendees?.length || 0})</button>
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Ticket Breakdown Table */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '1rem' }}>🎟️ Chi tiết hạng vé</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hạng vé</th>
                    <th>Zone</th>
                    <th>Giá</th>
                    <th>Đã bán</th>
                    <th>Còn lại</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ticketBreakdown?.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Chưa có hạng vé</td></tr>
                  ) : stats.ticketBreakdown?.map((t, i) => {
                    const pct = t.totalQuantity > 0 ? (t.soldQuantity / t.totalQuantity * 100) : 0;
                    return (
                      <tr key={t.ticketCategoryId}>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                          {t.ticketName}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{t.zoneName}</td>
                        <td style={{ color: '#fdcb6e', fontWeight: 600 }}>{formatCurrency(t.price)}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#74b9ff' }}>{t.soldQuantity}</span>
                          <span style={{ color: 'var(--text-muted)' }}>/{t.totalQuantity}</span>
                          <div style={{ marginTop: 4, background: 'var(--bg-lighter)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, background: COLORS[i % COLORS.length], height: '100%', borderRadius: 4, transition: 'width 0.5s ease' }} />
                          </div>
                        </td>
                        <td style={{ color: t.remainingQuantity === 0 ? '#e74c3c' : '#00b894', fontWeight: 600 }}>
                          {t.remainingQuantity === 0 ? 'HẾT' : t.remainingQuantity}
                        </td>
                        <td style={{ fontWeight: 700, color: '#ffeaa7' }}>{formatCurrency(t.revenue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '1rem' }}>📊 Biểu đồ bán vé theo hạng</h3>
            {chartData.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 8, color: '#fff' }}
                    />
                    <Bar dataKey="sold" name="Đã bán" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                    <Bar dataKey="remaining" name="Còn lại" fill="#636e72" radius={[4, 4, 0, 0]} opacity={0.4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Chưa có dữ liệu hạng vé
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Attendees */}
      {activeTab === 'attendees' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>👥 Danh sách người tham gia</h3>
            <input
              type="text"
              placeholder="🔍 Tìm tên, email, mã đơn..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg-lighter)', color: '#fff', width: 300, fontSize: '0.9rem'
              }}
            />
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vé</th>
                  <th>Chi tiết vé</th>
                  <th>Tổng tiền</th>
                  <th>Check-in</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có người tham gia'}
                  </td></tr>
                ) : filteredAttendees.map(a => (
                  <tr key={a.bookingId}>
                    <td className="booking-code">{a.bookingCode}</td>
                    <td style={{ fontWeight: 600 }}>{a.fullName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{a.email}</td>
                    <td style={{ fontWeight: 700, color: '#74b9ff' }}>{a.ticketCount}</td>
                    <td style={{ fontSize: '0.85rem', color: '#fdcb6e' }}>{a.ticketDetails || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{formatCurrency(a.totalAmount)}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                        background: a.isCheckedIn ? 'rgba(0,184,148,0.15)' : 'rgba(149,165,166,0.15)',
                        color: a.isCheckedIn ? '#00b894' : '#95a5a6'
                      }}>
                        {a.isCheckedIn ? '✓ Đã vào' : '— Chưa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttendees.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>Tổng: {filteredAttendees.length} người tham gia</span>
              <span>Check-in: {filteredAttendees.filter(a => a.isCheckedIn).length}/{filteredAttendees.length}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
