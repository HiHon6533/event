export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

export const CATEGORY_LABELS = {
  CONCERT: 'Hòa nhạc', THEATER: 'Kịch', MUSICAL: 'Nhạc kịch',
  FESTIVAL: 'Lễ hội', CONFERENCE: 'Hội nghị', SPORTS: 'Thể thao',
  WORKSHOP: 'Workshop', OTHER: 'Khác',
};

export const CATEGORY_COLORS = {
  CONCERT: '#e74c3c', THEATER: '#9b59b6', MUSICAL: '#e91e63',
  FESTIVAL: '#f39c12', CONFERENCE: '#3498db', SPORTS: '#2ecc71',
  WORKSHOP: '#1abc9c', OTHER: '#95a5a6',
};

export const STATUS_LABELS = {
  DRAFT: 'Nháp', PUBLISHED: 'Đang bán', CANCELLED: 'Đã hủy', COMPLETED: 'Hoàn thành',
  PENDING: 'Chờ xử lý', CONFIRMED: 'Đã xác nhận',
  SUCCESS: 'Thành công', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền',
};

export const STATUS_COLORS = {
  DRAFT: '#95a5a6', PUBLISHED: '#27ae60', CANCELLED: '#e74c3c', COMPLETED: '#3498db',
  PENDING: '#f39c12', CONFIRMED: '#27ae60',
  SUCCESS: '#27ae60', FAILED: '#e74c3c', REFUNDED: '#8e44ad',
};
