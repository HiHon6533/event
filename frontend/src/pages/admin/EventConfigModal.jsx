import React, { useState, useEffect } from 'react';
import { eventApi, zoneApi, ticketApi } from '../../services/api';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function EventConfigView({ event, onComplete }) {
  const [activeTab, setActiveTab] = useState('times'); // 'times', 'zones', 'tickets'

  // --- Times State ---
  const [timesData, setTimesData] = useState({ startTime: '', endTime: '' });
  const [timesSubmitting, setTimesSubmitting] = useState(false);

  // --- Zones State ---
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zoneForm, setZoneForm] = useState({ name: '', description: '', capacity: '', type: 'STANDING', sortOrder: 0 });
  const [zoneSubmitting, setZoneSubmitting] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState(null);

  // --- Tickets State ---
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({ zoneId: '', name: '', description: '', price: '', totalQuantity: '', maxPerBooking: 10 });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);

  const formatForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date - offset)).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (event) {
      setTimesData({
        startTime: formatForInput(event.startTime),
        endTime: formatForInput(event.endTime)
      });
      loadZones();
      loadTickets();
      setActiveTab('times');
    }
  }, [event]);

  const loadZones = async () => {
    if (!event?.venueId && !event?.venue?.id) return;
    setZonesLoading(true);
    try {
      const vid = event.venueId || event.venue.id;
      const res = await zoneApi.getByVenue(vid);
      setZones(res.data);
    } catch (err) {
      toast.error('Lỗi tải danh sách zones');
    } finally {
      setZonesLoading(false);
    }
  };

  const loadTickets = async () => {
    if (!event?.id) return;
    setTicketsLoading(true);
    try {
      const res = await ticketApi.getByEvent(event.id);
      setTickets(res.data);
    } catch (err) {
      toast.error('Lỗi tải danh sách vé');
    } finally {
      setTicketsLoading(false);
    }
  };

  if (!event) return null;

  // --- Handlers: Times ---
  const handleTimesSubmit = async (e) => {
    e.preventDefault();
    setTimesSubmitting(true);
    try {
      // Just update the start/endTime of the event
      await eventApi.update(event.id, { ...event, startTime: timesData.startTime, endTime: timesData.endTime });
      toast.success('Cập nhật thời gian thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setTimesSubmitting(false);
    }
  };

  // --- Handlers: Zones ---
  const handleZoneSubmit = async (e) => {
    e.preventDefault();
    setZoneSubmitting(true);
    try {
      const payload = { ...zoneForm, venueId: event.venueId || event.venue?.id };
      if (editingZoneId) {
        await zoneApi.update(editingZoneId, payload);
        toast.success('Cập nhật Zone thành công');
      } else {
        await zoneApi.create(payload);
        toast.success('Tạo Zone thành công');
      }
      setZoneForm({ name: '', description: '', capacity: '', type: 'STANDING', sortOrder: 0 });
      setEditingZoneId(null);
      loadZones();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu Zone thất bại');
    } finally {
      setZoneSubmitting(false);
    }
  };

  const handleDeleteZone = async (id) => {
    if (!window.confirm('Chắc chắn xóa khu vực này?')) return;
    try {
      await zoneApi.delete(id);
      toast.success('Đã xóa Zone');
      loadZones();
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  const startEditZone = (z) => {
    setEditingZoneId(z.id);
    setZoneForm({ name: z.name, description: z.description || '', capacity: z.capacity, type: z.type, sortOrder: z.sortOrder || 0 });
  };

  // --- Handlers: Tickets ---
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketSubmitting(true);
    try {
      const payload = { ...ticketForm, eventId: event.id };
      if (editingTicketId) {
        await ticketApi.update(editingTicketId, payload);
        toast.success('Cập nhật hạng vé thành công');
      } else {
        await ticketApi.create(payload);
        toast.success('Tạo hạng vé thành công');
      }
      setTicketForm({ zoneId: '', name: '', description: '', price: '', totalQuantity: '', maxPerBooking: 10 });
      setEditingTicketId(null);
      loadTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lưu hạng vé thất bại');
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Chắc chắn xóa hạng vé này?')) return;
    try {
      await ticketApi.delete(id);
      toast.success('Đã xóa hạng vé');
      loadTickets();
    } catch (err) {
      toast.error('Xóa thất bại');
    }
  };

  const startEditTicket = (t) => {
    setEditingTicketId(t.id);
    setTicketForm({
      zoneId: t.zoneId || t.zone?.id || '',
      name: t.name,
      description: t.description || '',
      price: t.price,
      totalQuantity: t.totalQuantity,
      maxPerBooking: t.maxPerBooking || 10
    });
  };

  // --- Styles ---
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-lighter)', color: 'white', fontSize: '0.9rem' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 };
  const tabBtnStyle = (active) => ({
    flex: 1, padding: '12px', background: active ? 'rgba(216, 27, 46, 0.15)' : 'transparent',
    color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
    border: 'none', borderBottom: active ? '3px solid var(--primary-light)' : '3px solid transparent',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem'
  });

  return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button style={tabBtnStyle(activeTab === 'times')} onClick={() => setActiveTab('times')}>⏰ Thời gian</button>
          <button style={tabBtnStyle(activeTab === 'zones')} onClick={() => setActiveTab('zones')}>🏛️ Zones (Khu vực)</button>
          <button style={tabBtnStyle(activeTab === 'tickets')} onClick={() => setActiveTab('tickets')}>🎟️ Hạng vé</button>
        </div>

        {/* Content */}
        <div style={{ p: '24px', overflowY: 'auto', flex: 1, padding: '24px' }}>
          
          {/* TAB 1: TIMES */}
          {activeTab === 'times' && (
            <form onSubmit={handleTimesSubmit}>
              <div style={{ padding: '16px', background: 'rgba(216, 27, 46, 0.06)', borderRadius: '12px', border: '1px solid rgba(216, 27, 46, 0.15)', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: 'var(--primary-light)' }}>Điều chỉnh thời gian sự kiện</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Bắt đầu <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input type="datetime-local" value={timesData.startTime} onChange={e => setTimesData({...timesData, startTime: e.target.value})} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Kết thúc <span style={{ color: '#e74c3c' }}>*</span></label>
                    <input type="datetime-local" value={timesData.endTime} onChange={e => setTimesData({...timesData, endTime: e.target.value})} required style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <button type="submit" className="btn btn-primary" disabled={timesSubmitting}>{timesSubmitting ? '⏳ Đang lưu...' : '💾 Cập nhật Thời gian'}</button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: ZONES */}
          {activeTab === 'zones' && (
            <div>
              <div style={{ background: 'rgba(0, 184, 148, 0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(0, 184, 148, 0.15)', marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#00b894' }}>{editingZoneId ? '✏️ Cập nhật Zone' : '➕ Thêm Zone mới cho Địa điểm'}</h3>
                <form onSubmit={handleZoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Tên Zone / Khu vực <span style={{ color: '#e74c3c' }}>*</span></label>
                      <input type="text" placeholder="VD: VIP 1, Standard..." value={zoneForm.name} onChange={e => setZoneForm({...zoneForm, name: e.target.value})} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Sức chứa <span style={{ color: '#e74c3c' }}>*</span></label>
                      <input type="number" min="1" value={zoneForm.capacity} onChange={e => setZoneForm({...zoneForm, capacity: e.target.value})} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Loại <span style={{ color: '#e74c3c' }}>*</span></label>
                      <select value={zoneForm.type} onChange={e => setZoneForm({...zoneForm, type: e.target.value})} style={{...inputStyle, background: 'var(--bg-card)'}}>
                        <option value="STANDING">Đứng (Standing)</option>
                        <option value="SEATED">Ngồi (Seated)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Mô tả (Tuỳ chọn)</label>
                    <input type="text" placeholder="Chi tiết về khu vực..." value={zoneForm.description} onChange={e => setZoneForm({...zoneForm, description: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {editingZoneId && <button type="button" className="btn btn-secondary" style={{ marginRight: 8 }} onClick={() => { setEditingZoneId(null); setZoneForm({ name: '', description: '', capacity: '', type: 'STANDING', sortOrder: 0 }); }}>Hủy</button>}
                    <button type="submit" className="btn btn-primary" style={{ background: '#00b894' }} disabled={zoneSubmitting}>{zoneSubmitting ? '⏳...' : editingZoneId ? 'Lưu cập nhật' : '+ Thêm Zone'}</button>
                  </div>
                </form>
              </div>

              <h4 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Các khu vực (Zones) tại: {event.venueName || event.venue?.name || ` Địa điểm ID ${event.venueId}`}</h4>
              {zonesLoading ? <div className="spinner" style={{ margin: '0 auto' }}/> : (
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>Tên Zone</th><th>Loại</th><th>Sức chứa</th><th>Thao tác</th></tr></thead>
                    <tbody>
                      {zones.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>Chưa có khu vực nào</td></tr> :
                        zones.map(z => (
                          <tr key={z.id}>
                            <td>{z.name}</td>
                            <td>{z.type === 'STANDING' ? '🚶 Đứng' : '🪑 Ngồi'}</td>
                            <td>{z.capacity}</td>
                            <td>
                              <button className="btn btn-sm" style={{ background: '#0984e3', marginRight: 6 }} onClick={() => startEditZone(z)}>Sửa</button>
                              <button className="btn btn-sm" style={{ background: '#e74c3c' }} onClick={() => handleDeleteZone(z.id)}>Xóa</button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TICKETS */}
          {activeTab === 'tickets' && (
            <div>
              <div style={{ background: 'rgba(253, 203, 110, 0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(253, 203, 110, 0.2)', marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#fdcb6e' }}>{editingTicketId ? '✏️ Cập nhật Hạng vé' : '🎫 Thêm Hạng vé mới'}</h3>
                {zones.length === 0 ? (
                  <div style={{ color: '#e67e22', background: 'rgba(230, 126, 34, 0.1)', padding: 12, borderRadius: 8 }}>
                    ⚠️ Vui lòng chuyển sang tab "Zones" và tạo ít nhất 1 khu vực trước khi tạo vé.
                  </div>
                ) : (
                  <form onSubmit={handleTicketSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Zone áp dụng <span style={{ color: '#e74c3c' }}>*</span></label>
                        <select value={ticketForm.zoneId} onChange={e => setTicketForm({...ticketForm, zoneId: e.target.value})} required style={{...inputStyle, background: 'var(--bg-card)'}}>
                          <option value="">-- Chọn Zone --</option>
                          {zones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.capacity} chỗ)</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Tên Hạng vé <span style={{ color: '#e74c3c' }}>*</span></label>
                        <input type="text" placeholder="VD: GA, VIP, Premium..." value={ticketForm.name} onChange={e => setTicketForm({...ticketForm, name: e.target.value})} required style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Giá vé (VNĐ) <span style={{ color: '#e74c3c' }}>*</span></label>
                        <input type="number" min="0" placeholder="VD: 500000" value={ticketForm.price} onChange={e => setTicketForm({...ticketForm, price: e.target.value})} required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Tổng số vé bán <span style={{ color: '#e74c3c' }}>*</span></label>
                        <input type="number" min="1" value={ticketForm.totalQuantity} onChange={e => setTicketForm({...ticketForm, totalQuantity: e.target.value})} required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Tối đa/đơn <span style={{ color: '#e74c3c' }}>*</span></label>
                        <input type="number" min="1" value={ticketForm.maxPerBooking} onChange={e => setTicketForm({...ticketForm, maxPerBooking: e.target.value})} required style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Mô tả quyền lợi (Tuỳ chọn)</label>
                      <input type="text" placeholder="VD: Tặng kèm 1 lightstick..." value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {editingTicketId && <button type="button" className="btn btn-secondary" style={{ marginRight: 8 }} onClick={() => { setEditingTicketId(null); setTicketForm({ zoneId: '', name: '', description: '', price: '', totalQuantity: '', maxPerBooking: 10 }); }}>Hủy</button>}
                      <button type="submit" className="btn btn-primary" style={{ background: '#fdcb6e', color: 'black' }} disabled={ticketSubmitting}>{ticketSubmitting ? '⏳...' : editingTicketId ? 'Lưu cập nhật' : '+ Thêm Hạng vé'}</button>
                    </div>
                  </form>
                )}
              </div>

              <h4 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Danh sách Hạng vé</h4>
              {ticketsLoading ? <div className="spinner" style={{ margin: '0 auto' }}/> : (
                <div className="table-container">
                  <table className="data-table">
                    <thead><tr><th>Hạng vé</th><th>Zone</th><th>Giá</th><th>Số lượng</th><th>Thao tác</th></tr></thead>
                    <tbody>
                      {tickets.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>Chưa có hạng vé nào</td></tr> :
                        tickets.map(t => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 600 }}>{t.name}</td>
                            <td>{t.zone?.name || t.zoneId}</td>
                            <td style={{ color: '#fdcb6e' }}>{Number(t.price).toLocaleString()} ₫</td>
                            <td>{t.totalQuantity} (Tối đa {t.maxPerBooking})</td>
                            <td>
                              <button className="btn btn-sm" style={{ background: '#0984e3', marginRight: 6 }} onClick={() => startEditTicket(t)}>Sửa</button>
                              <button className="btn btn-sm" style={{ background: '#e74c3c' }} onClick={() => handleDeleteTicket(t.id)}>Xóa</button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-primary" style={{ background: '#27ae60' }} onClick={() => {
            toast.success('Đã hoàn tất toàn bộ dữ liệu sự kiện!');
            if(onComplete) onComplete();
          }}>
            ✅ Hoàn tất & Gửi yêu cầu duyệt tới Admin
          </button>
        </div>
      </div>
  );
}
