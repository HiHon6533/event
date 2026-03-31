-- ============================================================
-- EVENT BOOKING SYSTEM - SEED DATA (Việt Nam)
-- Chạy cùng spring.jpa.hibernate.ddl-auto=create
-- ============================================================

-- Users (bcrypt của "123456")
INSERT INTO users (id, email, password, full_name, phone, role, is_active, created_at, updated_at) VALUES 
(1, 'admin@eventbooking.com', '$2a$10$wT/tWnN7D9jL0S7lK03a7OP0zWe1IqInrR2I.0u2DqHhNlE3i3uRK', 'Admin Hệ Thống', '0901234567', 'ADMIN', 1, NOW(), NOW()),
(2, 'manager@eventbooking.com', '$2a$10$wT/tWnN7D9jL0S7lK03a7OP0zWe1IqInrR2I.0u2DqHhNlE3i3uRK', 'Ban Tổ Chức Sự Kiện', '0922334455', 'MANAGER', 1, NOW(), NOW()),
(3, 'user@eventbooking.com', '$2a$10$wT/tWnN7D9jL0S7lK03a7OP0zWe1IqInrR2I.0u2DqHhNlE3i3uRK', 'Nguyễn Văn Test', '0912345678', 'USER', 1, NOW(), NOW());

-- ============================================================
-- VENUES (5 địa điểm thực tế, có ảnh sơ đồ chỗ ngồi)
-- ============================================================
INSERT INTO venues (id, name, address, city, phone, description, image_url, seat_map_image, total_capacity, is_active, created_at, updated_at) VALUES
(1, 'Sân vận động Mỹ Đình',
   'Đường Lê Đức Thọ, Nam Từ Liêm', 'Hà Nội', '024-37854611',
   'Sân vận động quốc gia sức chứa 40.000 chỗ, nơi tổ chức các sự kiện thể thao và âm nhạc đình đám nhất Việt Nam.',
   'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
   '/seat-maps/stadium.png',
   40000, 1, NOW(), NOW()),
(2, 'Nhà thi đấu Phú Thọ',
   '219 Lý Thường Kiệt, Quận 11', 'Hồ Chí Minh', '028-38666666',
   'Trung tâm thể thao đa năng trong lòng TP.HCM, tổ chức cả thể thao và ca nhạc quy mô vừa.',
   'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800',
   '/seat-maps/arena.png',
   6000, 1, NOW(), NOW()),
(3, 'Trung tâm Hội nghị Quốc gia (NCC)',
   'Phạm Hùng, Nam Từ Liêm', 'Hà Nội', '024-37684042',
   'Phòng hòa nhạc cao cấp với âm thanh đẳng cấp quốc tế, phù hợp các liveshow nghệ thuật tinh tế.',
   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
   '/seat-maps/concert-hall.png',
   3500, 1, NOW(), NOW()),
(4, 'Sân khấu Trống Đồng',
   '55B Nguyễn Đình Chiểu, Quận 3', 'Hồ Chí Minh', '028-39326086',
   'Sân khấu hài kịch, tạp kỹ và ca nhạc thân thiện giữa lòng Sài Gòn.',
   'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
   '/seat-maps/theater.png',
   1200, 1, NOW(), NOW()),
(5, 'Cung Thể thao Quần Ngựa',
   '36 Văn Cao, Ba Đình', 'Hà Nội', '024-38354056',
   'Nhà thi đấu thể thao giữa trung tâm Hà Nội, sức chứa 4.000 chỗ ngồi, tiện nghi hiện đại.',
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
   '/seat-maps/sports-hall.png',
   4000, 1, NOW(), NOW());

-- ============================================================
-- ZONES - Venue 1: Sân vận động Mỹ Đình (9 zones)
-- ============================================================
INSERT INTO zones (id, venue_id, name, type, capacity, sort_order, is_active, created_at, updated_at) VALUES
(1,  1, 'VIP Sân Khấu',     'SEATED',   500,  1, 1, NOW(), NOW()),
(2,  1, 'A1 - Diamond',     'SEATED',   1000, 2, 1, NOW(), NOW()),
(3,  1, 'A2 - Gold',        'SEATED',   2000, 3, 1, NOW(), NOW()),
(4,  1, 'GA Trái (Đứng)',   'STANDING', 5000, 4, 1, NOW(), NOW()),
(5,  1, 'GA Phải (Đứng)',   'STANDING', 5000, 5, 1, NOW(), NOW()),
(6,  1, 'Khán Đài B Trái',  'SEATED',   4000, 6, 1, NOW(), NOW()),
(7,  1, 'Khán Đài B Phải',  'SEATED',   4000, 7, 1, NOW(), NOW()),
(8,  1, 'Khán Đài C',       'SEATED',   8000, 8, 1, NOW(), NOW()),
(9,  1, 'Khu Mái Hiên',     'STANDING', 3000, 9, 1, NOW(), NOW());

-- ============================================================
-- ZONES - Venue 2: Nhà thi đấu Phú Thọ (6 zones)
-- ============================================================
INSERT INTO zones (id, venue_id, name, type, capacity, sort_order, is_active, created_at, updated_at) VALUES
(10, 2, 'VIP Courtside',    'SEATED',   80,   1, 1, NOW(), NOW()),
(11, 2, 'Khán Đài A East',  'SEATED',   1000, 2, 1, NOW(), NOW()),
(12, 2, 'Khán Đài A West',  'SEATED',   1000, 3, 1, NOW(), NOW()),
(13, 2, 'Khán Đài B North', 'SEATED',   1200, 4, 1, NOW(), NOW()),
(14, 2, 'Khán Đài B South', 'SEATED',   1200, 5, 1, NOW(), NOW()),
(15, 2, 'Khu Đứng GA',      'STANDING', 1200, 6, 1, NOW(), NOW());

-- ============================================================
-- ZONES - Venue 3: NCC (6 zones)
-- ============================================================
INSERT INTO zones (id, venue_id, name, type, capacity, sort_order, is_active, created_at, updated_at) VALUES
(16, 3, 'VVIP Hàng Đầu',   'SEATED', 100, 1, 1, NOW(), NOW()),
(17, 3, 'Diamond Circle',   'SEATED', 300, 2, 1, NOW(), NOW()),
(18, 3, 'Tầng 1 Gold',      'SEATED', 800, 3, 1, NOW(), NOW()),
(19, 3, 'Tầng 1 Silver',    'SEATED', 900, 4, 1, NOW(), NOW()),
(20, 3, 'Tầng 2 Balcony',   'SEATED', 700, 5, 1, NOW(), NOW()),
(21, 3, 'Tầng 3 Gallery',   'SEATED', 600, 6, 1, NOW(), NOW());

-- ============================================================
-- ZONES - Venue 4: Sân khấu Trống Đồng (6 zones)
-- ============================================================
INSERT INTO zones (id, venue_id, name, type, capacity, sort_order, is_active, created_at, updated_at) VALUES
(22, 4, 'Hàng Ghế VIP',     'SEATED',   60,  1, 1, NOW(), NOW()),
(23, 4, 'Khu A Trung Tâm',  'SEATED',   200, 2, 1, NOW(), NOW()),
(24, 4, 'Khu B Bên Trái',   'SEATED',   200, 3, 1, NOW(), NOW()),
(25, 4, 'Khu C Bên Phải',   'SEATED',   200, 4, 1, NOW(), NOW()),
(26, 4, 'Phía Sau',         'SEATED',   340, 5, 1, NOW(), NOW()),
(27, 4, 'Khu Đứng Bar',     'STANDING', 200, 6, 1, NOW(), NOW());

-- ============================================================
-- ZONES - Venue 5: Cung Thể thao Quần Ngựa (6 zones)
-- ============================================================
INSERT INTO zones (id, venue_id, name, type, capacity, sort_order, is_active, created_at, updated_at) VALUES
(28, 5, 'VIP Floor',        'SEATED',   100,  1, 1, NOW(), NOW()),
(29, 5, 'Tribuna A',        'SEATED',   900,  2, 1, NOW(), NOW()),
(30, 5, 'Tribuna B',        'SEATED',   900,  3, 1, NOW(), NOW()),
(31, 5, 'Tribuna C',        'SEATED',   900,  4, 1, NOW(), NOW()),
(32, 5, 'GA Standing Zone', 'STANDING', 700,  5, 1, NOW(), NOW()),
(33, 5, 'Family Zone',      'SEATED',   500,  6, 1, NOW(), NOW());

-- ============================================================
-- EVENTS (7 sự kiện đa dạng: Sports, Concert, Shows tại Việt Nam)
-- ============================================================
INSERT INTO events (id, venue_id, manager_id, title, short_description, description, category, banner_url, thumbnail_url, start_time, end_time, status, is_featured, created_at, updated_at) VALUES
(1, 1, 2,
 'Anh Trai SayHi – The Final Concert 2026',
 'Đại nhạc hội đỉnh cao quy tụ 30 Anh Trai GenZ',
 'Đêm nhạc khép lại hành trình 1 năm của chương trình "Anh Trai SayHi" với hàng chục ca khúc viral: Ngáo Ngơ, Catch Me If You Can, Walk, Tình Đầu Quá Chén... Sân khấu công nghệ 360° hoành tráng tại Sân vận động Mỹ Đình.',
 'CONCERT',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
 DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY),
 'PUBLISHED', 1, NOW(), NOW()),

(2, 1, 2,
 'Việt Nam vs Thái Lan – Vòng Loại World Cup 2026',
 'Trận siêu kinh điển Đông Nam Á – Ai sẽ đi tiếp?',
 'Đội tuyển Việt Nam đối đầu kỳ phùng địch thủ Thái Lan trong trận lượt về vòng loại World Cup 2026 khu vực châu Á tại sân nhà Mỹ Đình. Đây là trận cầu quyết định tấm vé vào vòng tiếp theo.',
 'SPORTS',
 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200',
 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=400',
 DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY),
 'PUBLISHED', 1, NOW(), NOW()),

(3, 3, 2,
 'Soobin Hoàng Sơn – The Playah Live Concert',
 'Đêm nhạc thăng hoa: 10 năm một chặng đường',
 'Liveshow kỷ niệm 10 năm ca hát của SOOBIN với dàn nhạc giao hưởng Symphony và vũ đoàn 50 người. Khán giả sẽ được nghe lại hành trình từ "Đừng Nhìn Lại" đến "Có Chắc Yêu Là Đây" trong không gian âm nhạc đẳng cấp quốc tế tại NCC.',
 'CONCERT',
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200',
 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
 DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY),
 'PUBLISHED', 1, NOW(), NOW()),

(4, 4, 2,
 'Sài Gòn Tếu – Đêm Kể Chuyện Vol.5',
 'Hài độc thoại đỉnh cao – Cười không nhặt được mồm!',
 'Với sự tham gia của Uy Lê, Phương Nam, Minh Đạt và khách mời bí ẩn. Chương trình hài độc thoại (Stand-up Comedy) theo phong cách đặc sắc Sài Gòn.',
 'THEATER',
 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200',
 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400',
 DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY),
 'PUBLISHED', 0, NOW(), NOW()),

(5, 1, 2,
 'BlackPink – Born Pink World Tour (Encore Hà Nội)',
 'Đại tiệc âm nhạc K-Pop – Bringgg your pink hammer!',
 'Nhóm nữ hoàng K-Pop BLACKPINK quay trở lại Việt Nam trong đêm diễn Encore đặc biệt tại Sân vận động Mỹ Đình. Quy mô sản xuất quốc tế với sân khấu LED khổng lồ.',
 'CONCERT',
 'https://images.unsplash.com/photo-1520625905971-d419846b4850?w=1200',
 'https://images.unsplash.com/photo-1520625905971-d419846b4850?w=400',
 DATE_ADD(NOW(), INTERVAL 50 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY),
 'PUBLISHED', 1, NOW(), NOW()),

(6, 2, 2,
 'Chung Kết Bóng Chuyền Nữ VTV Cup 2026',
 'Quyết chiến đỉnh cao – Việt Nam vs Nhật Bản',
 'Trận chung kết giải bóng chuyền nữ quốc tế VTV Cup 2026 giữa đội tuyển Việt Nam và Nhật Bản. Hứa hẹn những pha tranh bóng kịch tính mãn nhãn.',
 'SPORTS',
 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200',
 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
 DATE_ADD(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY),
 'PUBLISHED', 0, NOW(), NOW()),

(7, 4, 2,
 'Trấn Thành – Lộ Mặt Tour 2026',
 'Hài kịch siêu phẩm Sài Gòn – Kể chuyện thói đời',
 'Liveshow hài kịch cá nhân đặc sắc của danh hài Trấn Thành. Show kéo dài 2 tiếng với những câu chuyện vừa hài hước vừa chạm đến trái tim.',
 'THEATER',
 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200',
 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400',
 DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY),
 'DRAFT', 0, NOW(), NOW());

-- ============================================================
-- TICKET CATEGORIES (luồng đặt vé chính thức)
-- ============================================================
INSERT INTO ticket_categories (id, event_id, zone_id, name, description, price, total_quantity, sold_quantity, remaining_quantity, max_per_booking, status, created_at, updated_at) VALUES
-- Event 1: Anh Trai SayHi (Mỹ Đình)
(1,  1, 1,  'VIP Sân Khấu',     'Sát sân khấu, view 360°',         5000000, 500,  45,  455, 4,  'AVAILABLE', NOW(), NOW()),
(2,  1, 2,  'A1 Diamond',        'Hàng ghế Diamond trung tâm',      3500000, 1000, 120, 880, 6,  'AVAILABLE', NOW(), NOW()),
(3,  1, 3,  'A2 Gold',           'Khu Gold view rộng',               2000000, 2000, 300, 1700, 6, 'AVAILABLE', NOW(), NOW()),
(4,  1, 4,  'GA Trái (Đứng)',    'Khu vực đứng phía trái sân khấu', 1500000, 5000, 800, 4200, 4, 'AVAILABLE', NOW(), NOW()),
(5,  1, 8,  'Khán Đài C',        'Khu khán đài phía sau',            800000,  8000, 500, 7500, 10, 'AVAILABLE', NOW(), NOW()),

-- Event 2: Việt Nam vs Thái Lan (Mỹ Đình)
(6,  2, 6,  'Khán Đài B Trái',   'View trực diện sân cỏ',           800000,  4000, 1200, 2800, 10, 'AVAILABLE', NOW(), NOW()),
(7,  2, 7,  'Khán Đài B Phải',   'Phía đối diện',                   800000,  4000, 900,  3100, 10, 'AVAILABLE', NOW(), NOW()),
(8,  2, 8,  'Khán Đài C',        'Phía sau khung thành',             500000,  8000, 2000, 6000, 10, 'AVAILABLE', NOW(), NOW()),

-- Event 3: Soobin Concert (NCC)
(9,  3, 16, 'VVIP Hàng Đầu',     'Có quà tặng riêng, Meet & Greet', 3000000, 100,  15,  85,  2,  'AVAILABLE', NOW(), NOW()),
(10, 3, 17, 'Diamond Circle',    'Vòng tròn Diamond gần sân khấu',  2200000, 300,  40,  260, 4,  'AVAILABLE', NOW(), NOW()),
(11, 3, 18, 'Tầng 1 Gold',       'Tầng trệt khu Gold',              1500000, 800,  100, 700, 6,  'AVAILABLE', NOW(), NOW()),
(12, 3, 20, 'Tầng 2 Balcony',    'Ban công tầng 2',                  800000,  700,  50,  650, 6,  'AVAILABLE', NOW(), NOW()),

-- Event 4: Sài Gòn Tếu (Trống Đồng)
(13, 4, 22, 'Hàng VIP',          'Sát sân khấu, ưu đãi đặc biệt',   500000,  60,   10,  50,  4,  'AVAILABLE', NOW(), NOW()),
(14, 4, 23, 'Khu A Trung Tâm',   'Vị trí trung tâm tốt nhất',       350000,  200,  30,  170, 6,  'AVAILABLE', NOW(), NOW()),
(15, 4, 26, 'Phía Sau',          'Giá rẻ, view ổn',                  200000,  340,  20,  320, 8,  'AVAILABLE', NOW(), NOW()),

-- Event 5: BlackPink (Mỹ Đình)
(16, 5, 1,  'VIP BlackPink',     'Sound check + quà exclusive',      9800000, 500,  100, 400, 2,  'AVAILABLE', NOW(), NOW()),
(17, 5, 2,  'A1 Diamond BP',     'Diamond hàng đầu',                 6500000, 1000, 200, 800, 4,  'AVAILABLE', NOW(), NOW()),
(18, 5, 4,  'GA Trái (Đứng)',    'Khu vực đứng fan cuồng nhiệt',     2500000, 5000, 1500, 3500, 4, 'AVAILABLE', NOW(), NOW()),
(19, 5, 8,  'Khán Đài C',        'View tổng thể sân khấu',           1200000, 8000, 800, 7200, 10, 'AVAILABLE', NOW(), NOW()),

-- Event 6: Bóng chuyền VTV Cup (Phú Thọ)
(20, 6, 10, 'VIP Courtside',     'Sát sân, xem cận cảnh',            350000,  80,   20,  60,  4,  'AVAILABLE', NOW(), NOW()),
(21, 6, 11, 'Khán Đài A East',   'Khán đài East nhìn tổng thể',      200000,  1000, 150, 850, 10, 'AVAILABLE', NOW(), NOW()),
(22, 6, 13, 'Khán Đài B North',  'Phía sau lưới North',              150000,  1200, 80,  1120, 10, 'AVAILABLE', NOW(), NOW()),

-- Event 7: Trấn Thành Show (Trống Đồng) - DRAFT
(23, 7, 22, 'Hàng VIP TT',       'VIP sát sân khấu',                 800000,  60,   0,   60,  4,  'AVAILABLE', NOW(), NOW()),
(24, 7, 23, 'Khu A Trung Tâm',   'Trung tâm sân khấu',              600000,  200,  0,   200, 6,  'AVAILABLE', NOW(), NOW()),
(25, 7, 27, 'Khu Đứng Bar',      'Đứng uống + xem show',             300000,  200,  0,   200, 4,  'AVAILABLE', NOW(), NOW());
