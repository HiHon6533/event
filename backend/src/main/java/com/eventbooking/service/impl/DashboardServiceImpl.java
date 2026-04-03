package com.eventbooking.service.impl;

import com.eventbooking.dto.response.BookingResponse;
import com.eventbooking.dto.response.DashboardResponse;
import com.eventbooking.dto.response.DailyRevenueResponse;
import com.eventbooking.dto.response.TopEventDto;
import com.eventbooking.dto.response.TopOrganizerDto;
import com.eventbooking.entity.Booking;
import com.eventbooking.entity.enums.BookingStatus;
import com.eventbooking.entity.enums.EventStatus;
import com.eventbooking.entity.enums.OrganizerRequestStatus;
import com.eventbooking.mapper.BookingMapper;
import com.eventbooking.repository.BookingRepository;
import com.eventbooking.repository.EventRepository;
import com.eventbooking.repository.OrganizerRegistrationRepository;
import com.eventbooking.repository.UserRepository;
import com.eventbooking.service.DashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.eventbooking.security.SecurityUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Dịch vụ xử lý dữ liệu tổng quan thống kê (Dashboard) như tổng doanh thu, số lượng đơn, hiển thị biểu đồ.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final OrganizerRegistrationRepository organizerRegistrationRepository;
    private final BookingMapper bookingMapper;
    private final SecurityUtils securityUtils;

    public DashboardServiceImpl(UserRepository userRepository, EventRepository eventRepository,
                               BookingRepository bookingRepository,
                               OrganizerRegistrationRepository organizerRegistrationRepository,
                               BookingMapper bookingMapper,
                               SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.organizerRegistrationRepository = organizerRegistrationRepository;
        this.bookingMapper = bookingMapper;
        this.securityUtils = securityUtils;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats() {
        long totalUsers = 0;
        long totalEvents;
        long totalBookings;
        long confirmedBookings;
        long cancelledBookings;
        long pendingEvents = 0;
        long pendingOrganizerRequests = 0;
        BigDecimal totalRevenue;
        BigDecimal monthlyRevenue;
        List<BookingResponse> recentBookings;
        List<DailyRevenueResponse> dailyRevenues = new ArrayList<>();
        List<TopEventDto> topEvents = new ArrayList<>();
        List<TopOrganizerDto> topOrganizers = new ArrayList<>();
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30).withHour(0).withMinute(0).withSecond(0);

        List<Booking> recentConfirmedBookings;

        if (securityUtils.isCurrentUserManager()) {
            Long managerId = securityUtils.getCurrentUserId();
            totalEvents = eventRepository.countByManagerId(managerId);
            totalBookings = bookingRepository.countByManagerId(managerId);
            confirmedBookings = bookingRepository.countByStatusAndManagerId(BookingStatus.CONFIRMED, managerId);
            cancelledBookings = bookingRepository.countByStatusAndManagerId(BookingStatus.CANCELLED, managerId);
            totalRevenue = bookingRepository.getTotalRevenueByManagerId(managerId);
            monthlyRevenue = bookingRepository.getRevenueBetweenAndManagerId(startOfMonth, LocalDateTime.now(), managerId);
            recentBookings = bookingRepository.findByEventManagerIdOrderByCreatedAtDesc(
                    managerId, PageRequest.of(0, 10))
                    .getContent().stream()
                    .map(bookingMapper::toResponse)
                    .collect(Collectors.toList());
            recentConfirmedBookings = bookingRepository.findConfirmedBookingsSinceByManagerId(thirtyDaysAgo, managerId);

            // Top events for Manager
            List<Object[]> topEventsData = bookingRepository.findTopEventsByRevenueAndManagerId(managerId, PageRequest.of(0, 5));
            for (Object[] row : topEventsData) {
                topEvents.add(TopEventDto.builder()
                        .id((Long) row[0])
                        .title((String) row[1])
                        .category(row[2] != null ? row[2].toString() : null)
                        .imageUrl((String) row[3])
                        .totalTickets(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                        .totalRevenue((BigDecimal) row[5])
                        .build());
            }
        } else {
            // Admin sees everything
            totalUsers = userRepository.count();
            totalEvents = eventRepository.count();
            totalBookings = bookingRepository.count();
            confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
            cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);
            pendingEvents = eventRepository.countByStatus(EventStatus.PENDING_REVIEW);
            pendingOrganizerRequests = organizerRegistrationRepository.countByStatus(OrganizerRequestStatus.PENDING);
            totalRevenue = bookingRepository.getTotalRevenue();
            monthlyRevenue = bookingRepository.getRevenueBetween(startOfMonth, LocalDateTime.now());
            recentBookings = bookingRepository.findAllByOrderByCreatedAtDesc(
                    PageRequest.of(0, 10))
                    .getContent().stream()
                    .map(bookingMapper::toResponse)
                    .collect(Collectors.toList());
            recentConfirmedBookings = bookingRepository.findConfirmedBookingsSince(thirtyDaysAgo);
            
            // Map top events
            List<Object[]> topEventsData = bookingRepository.findTopEventsByRevenue(PageRequest.of(0, 5));
            for (Object[] row : topEventsData) {
                topEvents.add(TopEventDto.builder()
                        .id((Long) row[0])
                        .title((String) row[1])
                        .category(row[2] != null ? row[2].toString() : null)
                        .imageUrl((String) row[3])
                        .totalTickets(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                        .totalRevenue((BigDecimal) row[5])
                        .build());
            }

            // Map top organizers
            List<Object[]> topOrganizersData = bookingRepository.findTopOrganizersByRevenue(PageRequest.of(0, 5));
            for (Object[] row : topOrganizersData) {
                topOrganizers.add(TopOrganizerDto.builder()
                        .id((Long) row[0])
                        .fullName((String) row[1])
                        .email((String) row[2])
                        .totalEvents(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                        .totalTickets(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                        .totalRevenue((BigDecimal) row[5])
                        .build());
            }
        }

        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        if (monthlyRevenue == null) monthlyRevenue = BigDecimal.ZERO;

        // Group by day using TreeMap to keep them sorted
        Map<LocalDate, BigDecimal> revenueByDay = recentConfirmedBookings.stream()
                .filter(b -> b.getBookingDate() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getBookingDate().toLocalDate(),
                        TreeMap::new,
                        Collectors.reducing(BigDecimal.ZERO, Booking::getTotalAmount, BigDecimal::add)
                ));

        // Fill missing days with zero so the lines chart doesn't break
        for (int i = 0; i <= 30; i++) {
            LocalDate date = thirtyDaysAgo.toLocalDate().plusDays(i);
            revenueByDay.putIfAbsent(date, BigDecimal.ZERO);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (Map.Entry<LocalDate, BigDecimal> entry : revenueByDay.entrySet()) {
            dailyRevenues.add(DailyRevenueResponse.builder()
                    .date(entry.getKey().format(formatter))
                    .revenue(entry.getValue())
                    .build());
        }

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalEvents(totalEvents)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .pendingEvents(pendingEvents)
                .pendingOrganizerRequests(pendingOrganizerRequests)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .dailyRevenues(dailyRevenues)
                .recentBookings(recentBookings)
                .topEvents(topEvents)
                .topOrganizers(topOrganizers)
                .build();
    }
}
