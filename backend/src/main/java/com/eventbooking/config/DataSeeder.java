package com.eventbooking.config;

import com.eventbooking.entity.*;
import com.eventbooking.entity.enums.*;
import com.eventbooking.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds sample data on first run (only when DB is empty).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final ZoneRepository zoneRepository;
    private final EventRepository eventRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, VenueRepository venueRepository,
                      ZoneRepository zoneRepository, EventRepository eventRepository,
                      TicketCategoryRepository ticketCategoryRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.zoneRepository = zoneRepository;
        this.eventRepository = eventRepository;
        this.ticketCategoryRepository = ticketCategoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmail("manager@eventbooking.com").isPresent()) {
            return; // Manager already seeded
        }


        // ── Users ──────────────────────────────────────
        User admin = userRepository.findByEmail("admin@eventbooking.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .email("admin@eventbooking.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Admin Hệ Thống")
                .phone("0901234567")
                .role(UserRole.ADMIN)
                .isActive(true)
                .build())
        );

        User user1 = userRepository.findByEmail("user@eventbooking.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .email("user@eventbooking.com")
                .password(passwordEncoder.encode("user123"))
                .fullName("Nguyễn Văn A")
                .phone("0912345678")
                .role(UserRole.USER)
                .isActive(true)
                .build())
        );

        User manager = userRepository.findByEmail("manager@eventbooking.com").orElseGet(() ->
            userRepository.save(User.builder()
                .email("manager@eventbooking.com")
                .password(passwordEncoder.encode("manager123"))
                .fullName("Ban Tổ Chức Nhạc Hội")
                .phone("0922334455")
                .role(UserRole.MANAGER)
                .isActive(true)
                .build())
        );
        
        // If DB had venues, just exit after ensuring users exist so we don't duplicate events.
        if (venueRepository.count() > 0) {
            // But we should update existing events to belong to manager
            List<Event> allEvents = eventRepository.findAll();
            for (Event e : allEvents) {
                if (e.getManager() == null) {
                    e.setManager(manager);
                    eventRepository.save(e);
                }
            }
            return;
        }

        // ── Venues ─────────────────────────────────────
        Venue venue1 = venueRepository.save(Venue.builder()
                .name("Nhà hát Lớn Hà Nội")
                .address("1 Tràng Tiền, Hoàn Kiếm")
                .city("Hà Nội")
                .phone("024-39331113")
                .totalCapacity(600)
                .description("Nhà hát Lớn Hà Nội là công trình kiến trúc nổi tiếng, nơi diễn ra nhiều sự kiện văn hóa nghệ thuật hàng đầu.")
                .imageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800")
                .isActive(true)
                .build());

        Venue venue2 = venueRepository.save(Venue.builder()
                .name("Trung tâm Hội nghị Quốc gia")
                .address("Phạm Hùng, Mễ Trì, Nam Từ Liêm")
                .city("Hà Nội")
                .phone("024-37684968")
                .totalCapacity(3000)
                .description("Trung tâm Hội nghị Quốc gia Việt Nam - địa điểm tổ chức các sự kiện lớn quốc gia và quốc tế.")
                .imageUrl("https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800")
                .isActive(true)
                .build());

        Venue venue3 = venueRepository.save(Venue.builder()
                .name("Gem Center")
                .address("8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1")
                .city("TP. Hồ Chí Minh")
                .phone("028-38236060")
                .totalCapacity(800)
                .description("Gem Center - trung tâm hội nghị hiện đại bậc nhất TP.HCM.")
                .imageUrl("https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800")
                .isActive(true)
                .build());

        // ── Zones ──────────────────────────────────────
        Zone zone1A = zoneRepository.save(Zone.builder().venue(venue1).name("VIP").description("Khu VIP hàng đầu").capacity(50).sortOrder(1).isActive(true).build());
        Zone zone1B = zoneRepository.save(Zone.builder().venue(venue1).name("Thường").description("Khu ghế thường").capacity(250).sortOrder(2).isActive(true).build());
        Zone zone1C = zoneRepository.save(Zone.builder().venue(venue1).name("Balcony").description("Khu ban công tầng 2").capacity(300).sortOrder(3).isActive(true).build());

        Zone zone2A = zoneRepository.save(Zone.builder().venue(venue2).name("Diamond").description("Khu Diamond VIP").capacity(200).sortOrder(1).isActive(true).build());
        Zone zone2B = zoneRepository.save(Zone.builder().venue(venue2).name("Gold").description("Khu Gold").capacity(800).sortOrder(2).isActive(true).build());
        Zone zone2C = zoneRepository.save(Zone.builder().venue(venue2).name("Silver").description("Khu Silver").capacity(2000).sortOrder(3).isActive(true).build());

        Zone zone3A = zoneRepository.save(Zone.builder().venue(venue3).name("Premium").description("Khu Premium").capacity(100).sortOrder(1).isActive(true).build());
        Zone zone3B = zoneRepository.save(Zone.builder().venue(venue3).name("Standard").description("Khu Standard").capacity(700).sortOrder(2).isActive(true).build());

        // ── Events ─────────────────────────────────────
        LocalDateTime now = LocalDateTime.now();

        Event event1 = eventRepository.save(Event.builder()
                .venue(venue1)
                .manager(manager)
                .title("Đêm Nhạc Trịnh - Hạ Trắng")
                .description("Đắm chìm trong những giai điệu bất hủ của nhạc sĩ Trịnh Công Sơn. Chương trình quy tụ các nghệ sĩ: Hà Trần, Mỹ Tâm, Quang Dũng cùng dàn nhạc giao hưởng Quốc gia.")
                .shortDescription("Đêm nhạc Trịnh Công Sơn với sự tham gia của các nghệ sĩ hàng đầu")
                .category(EventCategory.CONCERT)
                .bannerUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400")
                .startTime(now.plusDays(15).withHour(19).withMinute(30))
                .endTime(now.plusDays(15).withHour(22).withMinute(0))
                .status(EventStatus.PUBLISHED)
                .isFeatured(true)
                .build());

        Event event2 = eventRepository.save(Event.builder()
                .venue(venue2)
                .manager(manager)
                .title("Tech Summit Vietnam 2026")
                .description("Hội nghị công nghệ lớn nhất Việt Nam năm 2026. Quy tụ hơn 50 diễn giả quốc tế, chia sẻ về AI, Cloud Computing, Blockchain và tương lai công nghệ Việt Nam.")
                .shortDescription("Hội nghị công nghệ hàng đầu với hơn 50 diễn giả quốc tế")
                .category(EventCategory.CONFERENCE)
                .bannerUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400")
                .startTime(now.plusDays(30).withHour(8).withMinute(0))
                .endTime(now.plusDays(31).withHour(17).withMinute(0))
                .status(EventStatus.PUBLISHED)
                .isFeatured(true)
                .build());

        Event event3 = eventRepository.save(Event.builder()
                .venue(venue3)
                .manager(manager)
                .title("Lễ hội Ẩm thực Quốc tế")
                .description("Lễ hội ẩm thực quốc tế với sự tham gia của hơn 100 đầu bếp từ 20 quốc gia. Thưởng thức hàng trăm món ăn đặc sắc từ khắp nơi trên thế giới.")
                .shortDescription("Lễ hội ẩm thực với hơn 100 đầu bếp quốc tế")
                .category(EventCategory.FESTIVAL)
                .bannerUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400")
                .startTime(now.plusDays(20).withHour(10).withMinute(0))
                .endTime(now.plusDays(22).withHour(22).withMinute(0))
                .status(EventStatus.PUBLISHED)
                .isFeatured(true)
                .build());

        Event event4 = eventRepository.save(Event.builder()
                .venue(venue1)
                .manager(manager)
                .title("Vở kịch: Tấm Cám - Phiên bản hiện đại")
                .description("Tấm Cám được dàn dựng theo phong cách sân khấu hiện đại, kết hợp nghệ thuật truyền thống và công nghệ ánh sáng 3D.")
                .shortDescription("Tấm Cám phiên bản hiện đại với công nghệ 3D")
                .category(EventCategory.THEATER)
                .bannerUrl("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400")
                .startTime(now.plusDays(10).withHour(20).withMinute(0))
                .endTime(now.plusDays(10).withHour(22).withMinute(30))
                .status(EventStatus.PUBLISHED)
                .isFeatured(false)
                .build());

        Event event5 = eventRepository.save(Event.builder()
                .venue(venue2)
                .manager(manager)
                .title("Chung kết Giải Esports Quốc gia 2026")
                .description("Giải đấu Esports lớn nhất Việt Nam với tổng giải thưởng 2 tỷ đồng. Các đội tuyển hàng đầu tranh tài ở bộ môn League of Legends và Valorant.")
                .shortDescription("Chung kết Esports quốc gia - tổng giải thưởng 2 tỷ")
                .category(EventCategory.SPORTS)
                .bannerUrl("https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1511882150382-421056c89033?w=400")
                .startTime(now.plusDays(25).withHour(13).withMinute(0))
                .endTime(now.plusDays(25).withHour(21).withMinute(0))
                .status(EventStatus.PUBLISHED)
                .isFeatured(true)
                .build());

        Event event6 = eventRepository.save(Event.builder()
                .venue(venue3)
                .manager(manager)
                .title("Workshop: Nhiếp ảnh & Nghệ thuật thị giác")
                .description("Workshop chuyên sâu về nhiếp ảnh nghệ thuật dành cho người đam mê, do các nhiếp ảnh gia nổi tiếng hướng dẫn.")
                .shortDescription("Workshop nhiếp ảnh nghệ thuật cùng chuyên gia")
                .category(EventCategory.WORKSHOP)
                .bannerUrl("https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200")
                .thumbnailUrl("https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400")
                .startTime(now.plusDays(12).withHour(9).withMinute(0))
                .endTime(now.plusDays(12).withHour(16).withMinute(0))
                .status(EventStatus.PUBLISHED)
                .isFeatured(false)
                .build());

        // ── Ticket Categories ──────────────────────────
        // Event 1 - Nhạc Trịnh
        ticketCategoryRepository.saveAll(List.of(
            TicketCategory.builder().event(event1).zone(zone1A).name("VIP").description("Ghế VIP hàng đầu + quà tặng").price(new BigDecimal("1500000")).totalQuantity(50).soldQuantity(0).availableQuantity(50).maxPerBooking(4).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event1).zone(zone1B).name("Thường").description("Ghế thường tầng trệt").price(new BigDecimal("500000")).totalQuantity(250).soldQuantity(0).availableQuantity(250).maxPerBooking(6).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event1).zone(zone1C).name("Balcony").description("Ghế ban công tầng 2").price(new BigDecimal("300000")).totalQuantity(300).soldQuantity(0).availableQuantity(300).maxPerBooking(8).status(TicketStatus.AVAILABLE).build()
        ));

        // Event 2 - Tech Summit
        ticketCategoryRepository.saveAll(List.of(
            TicketCategory.builder().event(event2).zone(zone2A).name("Diamond Pass").description("Full access + networking dinner + recording").price(new BigDecimal("5000000")).totalQuantity(200).soldQuantity(0).availableQuantity(200).maxPerBooking(2).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event2).zone(zone2B).name("Gold Pass").description("Full access + networking").price(new BigDecimal("2000000")).totalQuantity(800).soldQuantity(0).availableQuantity(800).maxPerBooking(5).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event2).zone(zone2C).name("Silver Pass").description("General access").price(new BigDecimal("800000")).totalQuantity(2000).soldQuantity(0).availableQuantity(2000).maxPerBooking(10).status(TicketStatus.AVAILABLE).build()
        ));

        // Event 3 - Festival ẩm thực
        ticketCategoryRepository.saveAll(List.of(
            TicketCategory.builder().event(event3).zone(zone3A).name("Premium").description("Vé Premium + buffet cao cấp").price(new BigDecimal("800000")).totalQuantity(100).soldQuantity(0).availableQuantity(100).maxPerBooking(4).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event3).zone(zone3B).name("Standard").description("Vé vào cửa tiêu chuẩn").price(new BigDecimal("200000")).totalQuantity(700).soldQuantity(0).availableQuantity(700).maxPerBooking(10).status(TicketStatus.AVAILABLE).build()
        ));

        // Event 4 - Vở kịch
        ticketCategoryRepository.saveAll(List.of(
            TicketCategory.builder().event(event4).zone(zone1A).name("Hạng A").description("Ghế VIP trung tâm").price(new BigDecimal("600000")).totalQuantity(50).soldQuantity(0).availableQuantity(50).maxPerBooking(4).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event4).zone(zone1B).name("Hạng B").description("Ghế thường").price(new BigDecimal("300000")).totalQuantity(250).soldQuantity(0).availableQuantity(250).maxPerBooking(6).status(TicketStatus.AVAILABLE).build()
        ));

        // Event 5 - Esports
        ticketCategoryRepository.saveAll(List.of(
            TicketCategory.builder().event(event5).zone(zone2A).name("Ringside").description("Ghế sát sân đấu").price(new BigDecimal("1200000")).totalQuantity(200).soldQuantity(0).availableQuantity(200).maxPerBooking(4).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event5).zone(zone2B).name("Premium").description("Khu ghế Premium").price(new BigDecimal("600000")).totalQuantity(800).soldQuantity(0).availableQuantity(800).maxPerBooking(6).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event5).zone(zone2C).name("General").description("Khu vực chung").price(new BigDecimal("200000")).totalQuantity(2000).soldQuantity(0).availableQuantity(2000).maxPerBooking(10).status(TicketStatus.AVAILABLE).build()
        ));

        // Event 6 - Workshop
        ticketCategoryRepository.saveAll(List.of(
            TicketCategory.builder().event(event6).zone(zone3A).name("Thực hành").description("Tham gia thực hành + tài liệu").price(new BigDecimal("1000000")).totalQuantity(30).soldQuantity(0).availableQuantity(30).maxPerBooking(2).status(TicketStatus.AVAILABLE).build(),
            TicketCategory.builder().event(event6).zone(zone3B).name("Quan sát").description("Tham dự và quan sát").price(new BigDecimal("300000")).totalQuantity(70).soldQuantity(0).availableQuantity(70).maxPerBooking(4).status(TicketStatus.AVAILABLE).build()
        ));

        System.out.println("=== DATA SEEDER: Đã tạo dữ liệu mẫu thành công ===");
        System.out.println("  Admin:   admin@eventbooking.com / admin123");
        System.out.println("  Manager: manager@eventbooking.com / manager123");
        System.out.println("  User:    user@eventbooking.com / user123");
        System.out.println("  Venues: 3 | Events: 6 | Ticket Categories: 15");
    }
}
