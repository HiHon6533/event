import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/helpers';
import { HiOutlineChartBar, HiOutlineCalendar, HiOutlineUsers, HiOutlineTicket, HiOutlineLocationMarker } from 'react-icons/hi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

function AdminSidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';
  return (
    <aside className="admin-sidebar">
      <h3 style={{ fontWeight: 700, marginBottom: 24, padding: '0 16px', color: 'var(--primary-light)' }}>⚙️ Quản trị</h3>
      <Link to="/" style={{ opacity: 0.8, marginBottom: 16 }}>
        👈 Trở về Trang chủ
      </Link>
      <Link to="/admin" className={isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}>
        <HiOutlineChartBar /> Dashboard
      </Link>
      <Link to="/admin/events" className={isActive('/admin/events')}>
        <HiOutlineCalendar /> Sự kiện
      </Link>
      <Link to="/admin/bookings" className={isActive('/admin/bookings')}>
        <HiOutlineTicket /> Đặt vé
      </Link>
      {isAdmin && (
        <>
          <Link to="/admin/venues" className={isActive('/admin/venues')}>
            <HiOutlineLocationMarker /> Địa điểm
          </Link>
          <Link to="/admin/users" className={isActive('/admin/users')}>
            <HiOutlineUsers /> Người dùng
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
    { icon: <HiOutlineCalendar />, label: 'Sự kiện', value: stats?.totalEvents || 0, color: '#6c5ce7' },
    { icon: <HiOutlineTicket />, label: 'Đặt vé', value: stats?.totalBookings || 0, color: '#00cec9' },
    { icon: <HiOutlineChartBar />, label: 'Tổng Doanh Thu', value: formatCurrency(stats?.totalRevenue || 0), color: '#ffeaa7' },
  ];

  if (isAdmin) {
    cards.splice(2, 0, { icon: <HiOutlineUsers />, label: 'Người dùng', value: stats?.totalUsers || 0, color: '#fd79a8' });
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
        <h1>📊 Dashboard</h1>
      </div>
      
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: '24px', marginBottom: '24px' }}>
        {cards.map((c, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
            <div style={{ background: `${c.color}20`, color: c.color, width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{c.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{c.label}</div>
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
