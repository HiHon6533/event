import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses by clearing token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ── Events ─────────────────────────────────────
export const eventApi = {
  getPublished: (params) => api.get('/events', { params }),
  getAllPublic: (params) => api.get('/events/all', { params }),
  getFeatured: () => api.get('/events/featured'),
  getSearchSuggestions: () => api.get('/events/search-suggestions'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  updateStatus: (id, status) => api.patch(`/events/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/events/${id}`),
  getAll: (params) => api.get('/events/admin/all', { params }),
};

// ── Venues ─────────────────────────────────────
export const venueApi = {
  getAll: () => api.get('/venues'),
  getById: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
};

// ── Zones ──────────────────────────────────────
export const zoneApi = {
  getByVenue: (venueId) => api.get(`/zones/venue/${venueId}`),
  create: (data) => api.post('/zones', data),
  update: (id, data) => api.put(`/zones/${id}`, data),
  delete: (id) => api.delete(`/zones/${id}`),
};

// ── Ticket Categories ──────────────────────────
export const ticketApi = {
  getByEvent: (eventId) => api.get(`/ticket-categories/event/${eventId}`),
  create: (data) => api.post('/ticket-categories', data),
  update: (id, data) => api.put(`/ticket-categories/${id}`, data),
  delete: (id) => api.delete(`/ticket-categories/${id}`),
};

// ── Bookings ───────────────────────────────────
export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getMy: (params) => api.get('/bookings/my', { params }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  getQrCode: (id) => api.get(`/bookings/${id}/qrcode`),
  getAll: (params) => api.get('/bookings/admin/all', { params }),
};

// ── Payments ───────────────────────────────────
export const paymentApi = {
  process: (data) => api.post('/payment', data),
  getByBooking: (bookingId) => api.get(`/payment/booking/${bookingId}`),
  createVnPayUrl: (bookingId) => api.post('/payment/create-vnpay-url', { bookingId }),
};

// ── Users ──────────────────────────────────────
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, null, { params: { role } }),
  toggleStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

// ── Organizer Registration ─────────────────────
export const organizerApi = {
  register: (data) => api.post('/users/register-organizer', data),
  getMyStatus: () => api.get('/users/organizer-status'),
  getRequests: (params) => api.get('/admin/organizer-requests', { params }),
  getPendingCount: () => api.get('/admin/organizer-requests/pending-count'),
  approve: (id) => api.patch(`/admin/organizer-requests/${id}/approve`),
  reject: (id, note) => api.patch(`/admin/organizer-requests/${id}/reject`, null, { params: { note } }),
};

// ── Dashboard ──────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

// ── File Uploads ───────────────────────────────
const uploadFile = (url, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadApi = {
  eventBanner: (eventId, file) => uploadFile(`/upload/events/${eventId}/banner`, file),
  eventThumbnail: (eventId, file) => uploadFile(`/upload/events/${eventId}/thumbnail`, file),
  eventMap: (eventId, file) => uploadFile(`/upload/events/${eventId}/map`, file),
  eventImage: (eventId, file) => uploadFile(`/upload/events/${eventId}/image`, file),
  eventOrganizerLogo: (eventId, file) => uploadFile(`/upload/events/${eventId}/organizer-logo`, file),
  userAvatar: (file) => uploadFile('/upload/users/avatar', file),
};

export default api;
