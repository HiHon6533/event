package com.eventbooking.config;

import com.eventbooking.entity.*;
import com.eventbooking.entity.enums.*;
import com.eventbooking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds initial data ONLY when the database is empty.
 * Once data is seeded, it will never be overwritten on subsequent restarts.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final ZoneRepository zoneRepository;
    private final EventRepository eventRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("✅ Database already has data. Skipping seed.");
            return;
        }

        log.info("🌱 Database is empty. Seeding initial data...");

        seedUsers();
        seedVenues();
        seedZones();
        seedEvents();
        seedTicketCategories();

        log.info("✅ Seed data initialized successfully!");
        log.info("📧 Admin login: admin@eventbooking.com / Admin@2026");
        log.info("📧 Manager login: manager@eventbooking.com / Manager@2026");
        log.info("📧 User login: user@eventbooking.com / User@2026");
    }

    private void seedUsers() {
        User admin = User.builder()
                .email("admin@eventbooking.com")
                .password(passwordEncoder.encode("Admin@2026"))
                .fullName("Admin Hệ Thống")
                .phone("0901234567")
                .role(UserRole.ADMIN)
                .isActive(true)
                .build();

        User manager = User.builder()
                .email("manager@eventbooking.com")
                .password(passwordEncoder.encode("Manager@2026"))
                .fullName("Ban Tổ Chức Sự Kiện")
                .phone("0922334455")
                .role(UserRole.MANAGER)
                .isActive(true)
                .build();

        User user = User.builder()
                .email("user@eventbooking.com")
                .password(passwordEncoder.encode("User@2026"))
                .fullName("Nguyễn Văn Test")
                .phone("0912345678")
                .role(UserRole.USER)
                .isActive(true)
                .build();

        userRepository.saveAll(List.of(admin, manager, user));
        log.info("  → 3 users created");
    }

    private void seedVenues() {
        List<Venue> venues = List.of(
            Venue.builder()
                .name("Sân vận động Mỹ Đình")
                .address("Đường Lê Đức Thọ, Nam Từ Liêm")
                .city("Hà Nội").phone("024-37854611")
                .description("Sân vận động quốc gia sức chứa 40.000 chỗ, nơi tổ chức các sự kiện thể thao và âm nhạc đình đám nhất Việt Nam.")
                .imageUrl("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800")
                .seatMapImage("/seat-maps/stadium.png")
                .totalCapacity(40000).isActive(true).build(),
            Venue.builder()
                .name("Nhà thi đấu Phú Thọ")
                .address("219 Lý Thường Kiệt, Quận 11")
                .city("Hồ Chí Minh").phone("028-38666666")
                .description("Trung tâm thể thao đa năng trong lòng TP.HCM, tổ chức cả thể thao và ca nhạc quy mô vừa.")
                .imageUrl("https://images.unsplash.com/photo-1511882150382-421056c89033?w=800")
                .seatMapImage("/seat-maps/arena.png")
                .totalCapacity(6000).isActive(true).build(),
            Venue.builder()
                .name("Trung tâm Hội nghị Quốc gia (NCC)")
                .address("Phạm Hùng, Nam Từ Liêm")
                .city("Hà Nội").phone("024-37684042")
                .description("Phòng hòa nhạc cao cấp với âm thanh đẳng cấp quốc tế, phù hợp các liveshow nghệ thuật tinh tế.")
                .imageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800")
                .seatMapImage("/seat-maps/concert-hall.png")
                .totalCapacity(3500).isActive(true).build(),
            Venue.builder()
                .name("Sân khấu Trống Đồng")
                .address("55B Nguyễn Đình Chiểu, Quận 3")
                .city("Hồ Chí Minh").phone("028-39326086")
                .description("Sân khấu hài kịch, tạp kỹ và ca nhạc thân thiện giữa lòng Sài Gòn.")
                .imageUrl("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800")
                .seatMapImage("/seat-maps/theater.png")
                .totalCapacity(1200).isActive(true).build(),
            Venue.builder()
                .name("Cung Thể thao Quần Ngựa")
                .address("36 Văn Cao, Ba Đình")
                .city("Hà Nội").phone("024-38354056")
                .description("Nhà thi đấu thể thao giữa trung tâm Hà Nội, sức chứa 4.000 chỗ ngồi, tiện nghi hiện đại.")
                .imageUrl("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800")
                .seatMapImage("/seat-maps/sports-hall.png")
                .totalCapacity(4000).isActive(true).build()
        );
        venueRepository.saveAll(venues);
        log.info("  → 5 venues created");
    }

    private void seedZones() {
        Venue v1 = venueRepository.findById(1L).orElseThrow();
        Venue v2 = venueRepository.findById(2L).orElseThrow();
        Venue v3 = venueRepository.findById(3L).orElseThrow();
        Venue v4 = venueRepository.findById(4L).orElseThrow();
        Venue v5 = venueRepository.findById(5L).orElseThrow();

        // Venue 1: Sân vận động Mỹ Đình (9 zones)
        List<Zone> v1Zones = List.of(
            zone(v1, "VIP Sân Khấu",     ZoneType.SEATED,   500,  1),
            zone(v1, "A1 - Diamond",     ZoneType.SEATED,   1000, 2),
            zone(v1, "A2 - Gold",        ZoneType.SEATED,   2000, 3),
            zone(v1, "GA Trái (Đứng)",   ZoneType.STANDING, 5000, 4),
            zone(v1, "GA Phải (Đứng)",   ZoneType.STANDING, 5000, 5),
            zone(v1, "Khán Đài B Trái",  ZoneType.SEATED,   4000, 6),
            zone(v1, "Khán Đài B Phải",  ZoneType.SEATED,   4000, 7),
            zone(v1, "Khán Đài C",       ZoneType.SEATED,   8000, 8),
            zone(v1, "Khu Mái Hiên",     ZoneType.STANDING, 3000, 9)
        );
        zoneRepository.saveAll(v1Zones);

        // Venue 2: Nhà thi đấu Phú Thọ (6 zones)
        List<Zone> v2Zones = List.of(
            zone(v2, "VIP Courtside",    ZoneType.SEATED,   80,   1),
            zone(v2, "Khán Đài A East",  ZoneType.SEATED,   1000, 2),
            zone(v2, "Khán Đài A West",  ZoneType.SEATED,   1000, 3),
            zone(v2, "Khán Đài B North", ZoneType.SEATED,   1200, 4),
            zone(v2, "Khán Đài B South", ZoneType.SEATED,   1200, 5),
            zone(v2, "Khu Đứng GA",      ZoneType.STANDING, 1200, 6)
        );
        zoneRepository.saveAll(v2Zones);

        // Venue 3: NCC (6 zones)
        List<Zone> v3Zones = List.of(
            zone(v3, "VVIP Hàng Đầu",   ZoneType.SEATED, 100, 1),
            zone(v3, "Diamond Circle",   ZoneType.SEATED, 300, 2),
            zone(v3, "Tầng 1 Gold",      ZoneType.SEATED, 800, 3),
            zone(v3, "Tầng 1 Silver",    ZoneType.SEATED, 900, 4),
            zone(v3, "Tầng 2 Balcony",   ZoneType.SEATED, 700, 5),
            zone(v3, "Tầng 3 Gallery",   ZoneType.SEATED, 600, 6)
        );
        zoneRepository.saveAll(v3Zones);

        // Venue 4: Sân khấu Trống Đồng (6 zones)
        List<Zone> v4Zones = List.of(
            zone(v4, "Hàng Ghế VIP",     ZoneType.SEATED,   60,  1),
            zone(v4, "Khu A Trung Tâm",  ZoneType.SEATED,   200, 2),
            zone(v4, "Khu B Bên Trái",   ZoneType.SEATED,   200, 3),
            zone(v4, "Khu C Bên Phải",   ZoneType.SEATED,   200, 4),
            zone(v4, "Phía Sau",         ZoneType.SEATED,   340, 5),
            zone(v4, "Khu Đứng Bar",     ZoneType.STANDING, 200, 6)
        );
        zoneRepository.saveAll(v4Zones);

        // Venue 5: Cung Thể thao Quần Ngựa (6 zones)
        List<Zone> v5Zones = List.of(
            zone(v5, "VIP Floor",        ZoneType.SEATED,   100,  1),
            zone(v5, "Tribuna A",        ZoneType.SEATED,   900,  2),
            zone(v5, "Tribuna B",        ZoneType.SEATED,   900,  3),
            zone(v5, "Tribuna C",        ZoneType.SEATED,   900,  4),
            zone(v5, "GA Standing Zone", ZoneType.STANDING, 700,  5),
            zone(v5, "Family Zone",      ZoneType.SEATED,   500,  6)
        );
        zoneRepository.saveAll(v5Zones);

        log.info("  → 33 zones created");
    }

    private void seedEvents() {
        User manager = userRepository.findByEmail("manager@eventbooking.com").orElseThrow();
        Venue v1 = venueRepository.findById(1L).orElseThrow();
        Venue v2 = venueRepository.findById(2L).orElseThrow();
        Venue v3 = venueRepository.findById(3L).orElseThrow();
        Venue v4 = venueRepository.findById(4L).orElseThrow();

        LocalDateTime now = LocalDateTime.now();

        List<Event> events = List.of(
            Event.builder()
                .venue(v1).manager(manager)
                .title("Anh Trai SayHi – The Final Concert 2026")
                .shortDescription("Đại nhạc hội đỉnh cao quy tụ 30 Anh Trai GenZ")
                .description("Đêm nhạc khép lại hành trình 1 năm của chương trình \"Anh Trai SayHi\" với hàng chục ca khúc viral: Ngáo Ngơ, Catch Me If You Can, Walk, Tình Đầu Quá Chén... Sân khấu công nghệ 360° hoành tráng tại Sân vận động Mỹ Đình.")
                .category(EventCategory.CONCERT)
                .bannerUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400")
                .startTime(now.plusDays(15)).endTime(now.plusDays(15).plusHours(4))
                .status(EventStatus.PUBLISHED).isFeatured(true).build(),

            Event.builder()
                .venue(v1).manager(manager)
                .title("Việt Nam vs Thái Lan – Vòng Loại World Cup 2026")
                .shortDescription("Trận siêu kinh điển Đông Nam Á – Ai sẽ đi tiếp?")
                .description("Đội tuyển Việt Nam đối đầu kỳ phùng địch thủ Thái Lan trong trận lượt về vòng loại World Cup 2026 khu vực châu Á tại sân nhà Mỹ Đình. Đây là trận cầu quyết định tấm vé vào vòng tiếp theo.")
                .category(EventCategory.SPORTS)
                .bannerUrl("https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1511882150382-421056c89033?w=400")
                .startTime(now.plusDays(10)).endTime(now.plusDays(10).plusHours(3))
                .status(EventStatus.PUBLISHED).isFeatured(true).build(),

            Event.builder()
                .venue(v3).manager(manager)
                .title("Soobin Hoàng Sơn – The Playah Live Concert")
                .shortDescription("Đêm nhạc thăng hoa: 10 năm một chặng đường")
                .description("Liveshow kỷ niệm 10 năm ca hát của SOOBIN với dàn nhạc giao hưởng Symphony và vũ đoàn 50 người. Khán giả sẽ được nghe lại hành trình từ \"Đừng Nhìn Lại\" đến \"Có Chắc Yêu Là Đây\" trong không gian âm nhạc đẳng cấp quốc tế tại NCC.")
                .category(EventCategory.CONCERT)
                .bannerUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400")
                .startTime(now.plusDays(30)).endTime(now.plusDays(30).plusHours(3))
                .status(EventStatus.PUBLISHED).isFeatured(true).build(),

            Event.builder()
                .venue(v4).manager(manager)
                .title("Sài Gòn Tếu – Đêm Kể Chuyện Vol.5")
                .shortDescription("Hài độc thoại đỉnh cao – Cười không nhặt được mồm!")
                .description("Với sự tham gia của Uy Lê, Phương Nam, Minh Đạt và khách mời bí ẩn. Chương trình hài độc thoại (Stand-up Comedy) theo phong cách đặc sắc Sài Gòn.")
                .category(EventCategory.THEATER)
                .bannerUrl("https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400")
                .startTime(now.plusDays(5)).endTime(now.plusDays(5).plusHours(2))
                .status(EventStatus.PUBLISHED).isFeatured(false).build(),

            Event.builder()
                .venue(v1).manager(manager)
                .title("BlackPink – Born Pink World Tour (Encore Hà Nội)")
                .shortDescription("Đại tiệc âm nhạc K-Pop – Bringgg your pink hammer!")
                .description("Nhóm nữ hoàng K-Pop BLACKPINK quay trở lại Việt Nam trong đêm diễn Encore đặc biệt tại Sân vận động Mỹ Đình. Quy mô sản xuất quốc tế với sân khấu LED khổng lồ.")
                .category(EventCategory.CONCERT)
                .bannerUrl("https://images.unsplash.com/photo-1520625905971-d419846b4850?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1520625905971-d419846b4850?w=400")
                .startTime(now.plusDays(50)).endTime(now.plusDays(50).plusHours(4))
                .status(EventStatus.PUBLISHED).isFeatured(true).build(),

            Event.builder()
                .venue(v2).manager(manager)
                .title("Chung Kết Bóng Chuyền Nữ VTV Cup 2026")
                .shortDescription("Quyết chiến đỉnh cao – Việt Nam vs Nhật Bản")
                .description("Trận chung kết giải bóng chuyền nữ quốc tế VTV Cup 2026 giữa đội tuyển Việt Nam và Nhật Bản. Hứa hẹn những pha tranh bóng kịch tính mãn nhãn.")
                .category(EventCategory.SPORTS)
                .bannerUrl("https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400")
                .startTime(now.plusDays(20)).endTime(now.plusDays(20).plusHours(3))
                .status(EventStatus.PUBLISHED).isFeatured(false).build(),

            Event.builder()
                .venue(v4).manager(manager)
                .title("Trấn Thành – Lộ Mặt Tour 2026")
                .shortDescription("Hài kịch siêu phẩm Sài Gòn – Kể chuyện thói đời")
                .description("Liveshow hài kịch cá nhân đặc sắc của danh hài Trấn Thành. Show kéo dài 2 tiếng với những câu chuyện vừa hài hước vừa chạm đến trái tim.")
                .category(EventCategory.THEATER)
                .bannerUrl("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400")
                .startTime(now.plusDays(14)).endTime(now.plusDays(14).plusHours(2))
                .status(EventStatus.DRAFT).isFeatured(false).build()
        );
        eventRepository.saveAll(events);
        log.info("  → 7 events created");
    }

    private void seedTicketCategories() {
        // Fetch events & zones by their auto-generated IDs
        List<Event> events = eventRepository.findAll();
        List<Zone> zones = zoneRepository.findAll();

        // Helper: find zone by name substring
        java.util.function.BiFunction<Long, String, Zone> findZone = (venueId, namePart) ->
            zones.stream()
                .filter(z -> z.getVenue().getId().equals(venueId) && z.getName().contains(namePart))
                .findFirst().orElseThrow(() -> new RuntimeException("Zone not found: " + namePart));

        Event e1 = events.get(0); // Anh Trai SayHi
        Event e2 = events.get(1); // VN vs THA
        Event e3 = events.get(2); // Soobin
        Event e4 = events.get(3); // Sài Gòn Tếu
        Event e5 = events.get(4); // BlackPink
        Event e6 = events.get(5); // VTV Cup
        Event e7 = events.get(6); // Trấn Thành

        List<TicketCategory> categories = List.of(
            // Event 1: Anh Trai SayHi (Mỹ Đình - venue 1)
            tc(e1, findZone.apply(1L, "VIP Sân Khấu"),  "VIP Sân Khấu",  "Sát sân khấu, view 360°",         5000000, 500,  45, 4),
            tc(e1, findZone.apply(1L, "A1 - Diamond"),   "A1 Diamond",    "Hàng ghế Diamond trung tâm",      3500000, 1000, 120, 6),
            tc(e1, findZone.apply(1L, "A2 - Gold"),      "A2 Gold",       "Khu Gold view rộng",               2000000, 2000, 300, 6),
            tc(e1, findZone.apply(1L, "GA Trái"),        "GA Trái (Đứng)","Khu vực đứng phía trái sân khấu", 1500000, 5000, 800, 4),
            tc(e1, findZone.apply(1L, "Khán Đài C"),     "Khán Đài C",    "Khu khán đài phía sau",            800000,  8000, 500, 10),

            // Event 2: Việt Nam vs Thái Lan (Mỹ Đình - venue 1)
            tc(e2, findZone.apply(1L, "B Trái"),  "Khán Đài B Trái", "View trực diện sân cỏ",    800000, 4000, 1200, 10),
            tc(e2, findZone.apply(1L, "B Phải"),  "Khán Đài B Phải", "Phía đối diện",            800000, 4000, 900,  10),
            tc(e2, findZone.apply(1L, "Khán Đài C"), "Khán Đài C",   "Phía sau khung thành",     500000, 8000, 2000, 10),

            // Event 3: Soobin Concert (NCC - venue 3)
            tc(e3, findZone.apply(3L, "VVIP"),       "VVIP Hàng Đầu",   "Có quà tặng riêng, Meet & Greet", 3000000, 100, 15, 2),
            tc(e3, findZone.apply(3L, "Diamond"),    "Diamond Circle",   "Vòng tròn Diamond gần sân khấu", 2200000, 300, 40, 4),
            tc(e3, findZone.apply(3L, "Gold"),       "Tầng 1 Gold",     "Tầng trệt khu Gold",             1500000, 800, 100, 6),
            tc(e3, findZone.apply(3L, "Balcony"),    "Tầng 2 Balcony",  "Ban công tầng 2",                 800000,  700, 50, 6),

            // Event 4: Sài Gòn Tếu (Trống Đồng - venue 4)
            tc(e4, findZone.apply(4L, "Hàng Ghế VIP"),    "Hàng VIP",        "Sát sân khấu, ưu đãi đặc biệt", 500000, 60,  10, 4),
            tc(e4, findZone.apply(4L, "Khu A Trung Tâm"), "Khu A Trung Tâm", "Vị trí trung tâm tốt nhất",      350000, 200, 30, 6),
            tc(e4, findZone.apply(4L, "Phía Sau"),        "Phía Sau",        "Giá rẻ, view ổn",                200000, 340, 20, 8),

            // Event 5: BlackPink (Mỹ Đình - venue 1)
            tc(e5, findZone.apply(1L, "VIP Sân Khấu"),  "VIP BlackPink",   "Sound check + quà exclusive",        9800000, 500,  100, 2),
            tc(e5, findZone.apply(1L, "A1 - Diamond"),   "A1 Diamond BP",   "Diamond hàng đầu",                   6500000, 1000, 200, 4),
            tc(e5, findZone.apply(1L, "GA Trái"),        "GA Trái (Đứng)",  "Khu vực đứng fan cuồng nhiệt",       2500000, 5000, 1500, 4),
            tc(e5, findZone.apply(1L, "Khán Đài C"),     "Khán Đài C",      "View tổng thể sân khấu",             1200000, 8000, 800, 10),

            // Event 6: VTV Cup (Phú Thọ - venue 2)
            tc(e6, findZone.apply(2L, "VIP Courtside"),  "VIP Courtside",   "Sát sân, xem cận cảnh",              350000, 80,   20, 4),
            tc(e6, findZone.apply(2L, "A East"),         "Khán Đài A East", "Khán đài East nhìn tổng thể",        200000, 1000, 150, 10),
            tc(e6, findZone.apply(2L, "B North"),        "Khán Đài B North","Phía sau lưới North",                 150000, 1200, 80, 10),

            // Event 7: Trấn Thành (Trống Đồng - venue 4) - DRAFT
            tc(e7, findZone.apply(4L, "Hàng Ghế VIP"),    "Hàng VIP TT",     "VIP sát sân khấu",               800000, 60,  0, 4),
            tc(e7, findZone.apply(4L, "Khu A Trung Tâm"), "Khu A Trung Tâm", "Trung tâm sân khấu",             600000, 200, 0, 6),
            tc(e7, findZone.apply(4L, "Khu Đứng Bar"),    "Khu Đứng Bar",    "Đứng uống + xem show",            300000, 200, 0, 4)
        );
        ticketCategoryRepository.saveAll(categories);
        log.info("  → 25 ticket categories created");
    }

    // ── Helper methods ──────────────────────────────────────────

    private Zone zone(Venue venue, String name, ZoneType type, int capacity, int sortOrder) {
        return Zone.builder()
                .venue(venue)
                .name(name)
                .type(type)
                .capacity(capacity)
                .sortOrder(sortOrder)
                .isActive(true)
                .build();
    }

    private TicketCategory tc(Event event, Zone zone, String name, String desc,
                              long price, int total, int sold, int maxPerBooking) {
        return TicketCategory.builder()
                .event(event)
                .zone(zone)
                .name(name)
                .description(desc)
                .price(BigDecimal.valueOf(price))
                .totalQuantity(total)
                .soldQuantity(sold)
                .remainingQuantity(total - sold)
                .maxPerBooking(maxPerBooking)
                .status(TicketStatus.AVAILABLE)
                .build();
    }
}
