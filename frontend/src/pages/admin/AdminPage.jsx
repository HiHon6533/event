import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { dashboardApi, organizerApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { HiOutlineChartBar, HiOutlineCalendar, HiOutlineUsers, HiOutlineTicket, HiOutlineLocationMarker, HiOutlineClipboardCheck, HiOutlineClock, HiOutlineShieldCheck, HiOutlineXCircle, HiOutlineCreditCard, HiOutlineCog } from 'react-icons/hi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

function AdminSidebar() {
  const { isAdmin, isManager, user } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      organizerApi.getPendingCount().then(res => setPendingCount(res.data.count)).catch(() => {});
    }
  }, [isAdmin]);

  return (
    <aside className="admin-sidebar">
      {/* Role Badge */}
      <div style={{ padding: '0 16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: isAdmin ? '#d81b2e' : '#181818', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.75rem', color: isAdmin ? '#e74c3c' : '#3498db', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isAdmin ? '⚙️ Admin' : '🏢 Ban tổ chức'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 16px 16px' }} />

      <Link to="/" style={{ opacity: 0.7, marginBottom: 12, fontSize: '0.9rem' }}>
        ← Trở về Trang chủ
      </Link>

      <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
        <HiOutlineChartBar /> Dashboard
      </Link>
      <Link to="/admin/events" className={isActive('/admin/events')}>
        <HiOutlineCalendar /> {isManager ? 'Sự kiện của tôi' : 'Quản lý Sự kiện'}
      </Link>
      <Link to="/admin/bookings" className={isActive('/admin/bookings')}>
        <HiOutlineTicket /> {isManager ? 'Đơn đặt vé' : 'Quản lý Đặt vé'}
      </Link>
      <Link to="/admin/cancellation-requests" className={isActive('/admin/cancellation-requests')}>
        <HiOutlineXCircle /> Yêu cầu Hủy
      </Link>

      {isAdmin && (
        <>
          <div style={{ height: 1, background: 'var(--border)', margin: '12px 16px' }} />
          <div style={{ padding: '0 16px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 600 }}>Nghiệp vụ / Hệ thống</div>
          <Link to="/admin/payments" className={isActive('/admin/payments')}>
            <HiOutlineCreditCard /> Giao dịch & Thanh toán
          </Link>
          <Link to="/admin/venues" className={isActive('/admin/venues')}>
            <HiOutlineLocationMarker /> Địa điểm
          </Link>
          <Link to="/admin/users" className={isActive('/admin/users')}>
            <HiOutlineUsers /> Người dùng
          </Link>
          <Link to="/admin/settings" className={isActive('/admin/settings')}>
            <HiOutlineCog /> Cấu hình hệ thống
          </Link>
          <Link to="/admin/organizer-requests" className={isActive('/admin/organizer-requests')} style={{ position: 'relative' }}>
            <HiOutlineClipboardCheck /> Duyệt BTC
            {pendingCount > 0 && (
              <span style={{ position: 'absolute', right: 16, background: '#e74c3c', color: '#fff', borderRadius: '10px', padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                {pendingCount}
              </span>
            )}
          </Link>
        </>
      )}
    </aside>
  );
}

function DashboardHome() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(7);

  useEffect(() => {
    dashboardApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  let cards = [
    { icon: <HiOutlineCalendar />, label: 'Sự kiện', value: stats?.totalEvents || 0, color: '#d81b2e' },
    { icon: <HiOutlineTicket />, label: 'Đặt vé', value: stats?.totalBookings || 0, color: '#e0e0e0' },
    { icon: <HiOutlineChartBar />, label: 'Tổng Doanh Thu', value: formatCurrency(stats?.totalRevenue || 0), color: '#ffeaa7' },
  ];

  if (isAdmin) {
    cards.splice(2, 0, { icon: <HiOutlineUsers />, label: 'Người dùng', value: stats?.totalUsers || 0, color: '#b01525' });
    if (stats?.pendingEvents > 0) {
      cards.push({ icon: <HiOutlineClock />, label: 'Chờ duyệt', value: stats.pendingEvents, color: '#e67e22' });
    }
    if (stats?.pendingOrganizerRequests > 0) {
      cards.push({ icon: <HiOutlineShieldCheck />, label: 'Duyệt BTC', value: stats.pendingOrganizerRequests, color: '#e74c3c' });
    }
  }

  // Chart data manipulations
  const chartData = stats?.dailyRevenues ? stats.dailyRevenues.slice(-daysFilter) : [];
  
  const pieData = [
    { name: 'Đã xác nhận', value: stats?.confirmedBookings || 0, color: '#00b894' },
    { name: 'Đã huỷ', value: stats?.cancelledBookings || 0, color: '#d63031' }
  ];

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📊 {isAdmin ? 'Dashboard Tổng quan' : 'Dashboard Sự kiện của tôi'}</h1>
      </div>
      
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: '20px', marginBottom: '24px' }}>
        {cards.map((c, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ background: `${c.color}20`, color: c.color, width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', flexShrink: 0 }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{c.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        
        {/* Doanh thu Area Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
               <h3 style={{ fontWeight: 700, margin: 0 }}>📈 Phân tích Doanh thu</h3>
               <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Dữ liệu theo ngày thực tế</div>
            </div>
            <select className="form-control" style={{ width: 'auto', padding: '8px 16px', border: 'none', background: 'var(--bg-input)', color: '#e2e8f0', cursor: 'pointer' }} value={daysFilter} onChange={e => setDaysFilter(Number(e.target.value))}>
              <option value={7} style={{ background: 'var(--bg-card)', color: '#fff' }}>7 Ngày qua</option>
              <option value={15} style={{ background: 'var(--bg-card)', color: '#fff' }}>15 Ngày qua</option>
              <option value={30} style={{ background: 'var(--bg-card)', color: '#fff' }}>30 Ngày qua</option>
            </select>
          </div>

          <div style={{ width: '100%', height: 350 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} style={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} style={{ fill: '#94a3b8' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: 'var(--primary-light)' }} 
                    formatter={(value) => [formatCurrency(value), 'Thực thu']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Chưa có dữ liệu giao dịch
              </div>
            )}
          </div>
        </div>

        {/* Trạng thái Booking Pie Chart */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 700, margin: 0 }}>🎯 Trạng thái Vé</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Tỷ lệ Xác nhận và Hủy (Tổng)</div>
          
          <div style={{ flex: 1, width: '100%', minHeight: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border)', borderRadius: '8px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Bookings Table */}
      {stats?.recentBookings && stats.recentBookings.length > 0 && (
        <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
          <h3 style={{ fontWeight: 700, margin: '0 0 16px 0' }}>🕐 Đơn đặt vé gần đây</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Mã</th><th>Khách hàng</th><th>Sự kiện</th><th>Tổng tiền</th><th>Trạng thái</th></tr>
              </thead>
              <tbody>
                {stats.recentBookings.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td className="booking-code">{b.bookingCode}</td>
                    <td>{b.userFullName || 'Khách'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.eventTitle}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span className="badge" style={{ background: b.status === 'CONFIRMED' ? '#27ae60' : b.status === 'CANCELLED' ? '#e74c3c' : '#f39c12', color: 'white' }}>
                        {b.status === 'CONFIRMED' ? 'Đã xác nhận' : b.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Events - visible to both Admin and Manager */}
      {stats?.topEvents && stats.topEvents.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: '24px', marginTop: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontWeight: 700, margin: '0 0 16px 0', color: '#0984e3' }}>🔥 Top Sự kiện Doanh thu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.topEvents.map((e, idx) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-lighter)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: idx < 3 ? '#e74c3c' : 'var(--text-muted)', width: '24px' }}>#{idx + 1}</div>
                  {e.imageUrl ? (
                    <img src={e.imageUrl} alt={e.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', background: 'var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🖼️</div>
                  )}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.totalTickets} vé bán ra</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                    {formatCurrency(e.totalRevenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Organizers - Admin only */}
          {isAdmin && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 700, margin: '0 0 16px 0', color: '#00b894' }}>👑 Top Ban tổ chức</h3>
              {stats?.topOrganizers && stats.topOrganizers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.topOrganizers.map((o, idx) => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-lighter)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: idx < 3 ? '#f1c40f' : 'var(--text-muted)', width: '24px' }}>#{idx + 1}</div>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#181818', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {o.fullName?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.totalEvents} sự kiện | {o.totalTickets} vé</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                        {formatCurrency(o.totalRevenue)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function AdminPage() {
  const { isAdmin, isManager, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!isAdmin && !isManager) return <Navigate to="/" />;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export { DashboardHome };
