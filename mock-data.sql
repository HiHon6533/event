-- Bước 1: Tạo ra 5 Khách hàng Vãng lai (ID từ 4 đến 8)
-- Mật khẩu mặc định cho tất cả là: user123 (Đã được mã hoá bcrypt)
INSERT INTO users (id, email, full_name, is_active, password, phone, role, created_at, updated_at) VALUES 
(4, 'khachhang1@gmail.com', 'Trần Thị Thảo', 1, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TsphxXK', '0911223344', 'USER', NOW(), NOW()),
(5, 'khachhang2@gmail.com', 'Lê Hoàng Long', 1, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TsphxXK', '0922334455', 'USER', NOW(), NOW()),
(6, 'khachhang3@gmail.com', 'Phạm Minh Quân', 1, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TsphxXK', '0933445566', 'USER', NOW(), NOW()),
(7, 'khachhang4@gmail.com', 'Hoàng Thu Trang', 1, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TsphxXK', '0944556677', 'USER', NOW(), NOW()),
(8, 'khachhang5@gmail.com', 'Vũ Đức Phát', 1, '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TsphxXK', '0955667788', 'USER', NOW(), NOW());

-- Bước 2: Sinh ra 15 lượt Đặt vé được rải đều cho 5 khách hàng trên và khách Nguyễn Văn A (ID 2)
INSERT INTO bookings (booking_code, user_id, event_id, total_tickets, total_amount, status, qr_code, note, booking_time, created_at, updated_at) VALUES 
('BK-MOCK01', 4, 1, 2, 800000, 'CONFIRMED', 'qr-mock-1', 'Mua vui vẻ', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
('BK-MOCK02', 5, 2, 1, 1500000, 'CONFIRMED', 'qr-mock-2', 'Mua 1', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
('BK-MOCK03', 6, 1, 3, 1200000, 'CONFIRMED', 'qr-mock-3', 'Đi cùng bạn', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
('BK-MOCK04', 7, 2, 2, 3000000, 'CONFIRMED', 'qr-mock-4', 'VIP', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
('BK-MOCK05', 8, 1, 1, 400000, 'CONFIRMED', 'qr-mock-5', 'Thường', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
('BK-MOCK06', 4, 2, 1, 1500000, 'CONFIRMED', 'qr-mock-6', '', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
('BK-MOCK07', 5, 1, 4, 1600000, 'CONFIRMED', 'qr-mock-7', '', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
('BK-MOCK08', 2, 2, 2, 3000000, 'CONFIRMED', 'qr-mock-8', 'Sát ngày', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
('BK-MOCK09', 6, 1, 1, 400000, 'CONFIRMED', 'qr-mock-9', 'VIP', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
('BK-MOCK10', 7, 2, 3, 4500000, 'CONFIRMED', 'qr-mock-10', 'Cực lớn', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('BK-MOCK11', 8, 1, 2, 800000, 'CONFIRMED', 'qr-mock-11', 'Tết', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('BK-MOCK12', 4, 2, 1, 1500000, 'CONFIRMED', 'qr-mock-12', 'Weekend', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('BK-MOCK13', 2, 1, 5, 2000000, 'CONFIRMED', 'qr-mock-13', 'Gia đình', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('BK-CANC01', 5, 1, 2, 800000, 'CANCELLED', NULL, 'Hủy lịch', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
('BK-CANC02', 6, 2, 1, 1500000, 'CANCELLED', NULL, 'Đổi ý', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));
