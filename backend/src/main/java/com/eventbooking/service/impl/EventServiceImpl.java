package com.eventbooking.service.impl;

import com.eventbooking.dto.request.EventRequest;
import com.eventbooking.dto.response.EventDetailResponse;
import com.eventbooking.dto.response.EventResponse;
import com.eventbooking.dto.response.EventStatsResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.entity.Event;
import com.eventbooking.entity.Booking;
import com.eventbooking.entity.TicketCategory;
import com.eventbooking.entity.Venue;
import com.eventbooking.entity.enums.BookingStatus;
import com.eventbooking.entity.enums.EventCategory;
import com.eventbooking.entity.enums.EventStatus;
import com.eventbooking.entity.User;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.EventMapper;
import com.eventbooking.repository.EventRepository;
import com.eventbooking.repository.TicketCategoryRepository;
import com.eventbooking.repository.UserRepository;
import com.eventbooking.repository.VenueRepository;
import com.eventbooking.security.SecurityUtils;
import com.eventbooking.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;

/**
 * Dịch vụ lớn quản lý mọi logic của Sự kiện: Tạo mới, tìm kiếm tối ưu (Smart search), phân trang, gợi ý, và phê duyệt.
 */
@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final com.eventbooking.repository.SearchHistoryRepository searchHistoryRepository;
    private final com.eventbooking.repository.BookingRepository bookingRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    private final com.eventbooking.service.EmailService emailService;
    private final EventMapper eventMapper;
    private final SecurityUtils securityUtils;

    public EventServiceImpl(EventRepository eventRepository, VenueRepository venueRepository,
                           UserRepository userRepository, com.eventbooking.repository.SearchHistoryRepository searchHistoryRepository,
                           com.eventbooking.repository.BookingRepository bookingRepository,
                           TicketCategoryRepository ticketCategoryRepository,
                           com.eventbooking.service.EmailService emailService,
                           EventMapper eventMapper, SecurityUtils securityUtils) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.bookingRepository = bookingRepository;
        this.ticketCategoryRepository = ticketCategoryRepository;
        this.emailService = emailService;
        this.eventMapper = eventMapper;
        this.securityUtils = securityUtils;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EventResponse> getPublishedEvents(EventCategory category, String keyword,
                                                           int page, int size) {
        Page<Event> events;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("startTime").ascending());

        String normalizedKeyword = null;
        if (keyword != null && !keyword.trim().isEmpty()) {
            String[] words = keyword.trim().replaceAll("[\"'\\-]", " ").trim().split("\\s+");
            normalizedKeyword = String.join("%", words);
        }

        if ((normalizedKeyword != null && !normalizedKeyword.isEmpty()) || category != null) {
            events = eventRepository.searchEvents(EventStatus.PUBLISHED, category, normalizedKeyword, pageRequest);
        } else {
            events = eventRepository.findByStatus(EventStatus.PUBLISHED, pageRequest);
        }

        return PageResponse.<EventResponse>builder()
                .content(events.getContent().stream().map(eventMapper::toResponse).collect(Collectors.toList()))
                .page(events.getNumber())
                .size(events.getSize())
                .totalElements(events.getTotalElements())
                .totalPages(events.getTotalPages())
                .last(events.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EventResponse> getAllEventsPublic(EventCategory category, String keyword, int page, int size) {
        Page<Event> events;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("startTime").descending());

        String normalizedKeyword = null;
        if (keyword != null && !keyword.trim().isEmpty()) {
            String[] words = keyword.trim().replaceAll("[\"'\\-]", " ").trim().split("\\s+");
            normalizedKeyword = String.join("%", words);
        }

        if ((normalizedKeyword != null && !normalizedKeyword.isEmpty()) || category != null) {
            events = eventRepository.searchAllEvents(category, normalizedKeyword, pageRequest);
        } else {
            events = eventRepository.findAll(pageRequest);
        }

        return PageResponse.<EventResponse>builder()
                .content(events.getContent().stream().map(eventMapper::toResponse).collect(Collectors.toList()))
                .page(events.getNumber())
                .size(events.getSize())
                .totalElements(events.getTotalElements())
                .totalPages(events.getTotalPages())
                .last(events.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getFeaturedEvents() {
        List<Event> trendingEvents = eventRepository.findTopTrendingEvents(EventStatus.PUBLISHED, PageRequest.of(0, 10)).getContent();

        java.util.List<EventResponse> response = new java.util.ArrayList<>();
        for (Event e : trendingEvents) {
            response.add(eventMapper.toResponse(e));
        }

        if (response.size() < 10) {
            List<Event> featuredInDb = eventRepository.findByIsFeaturedTrueAndStatus(EventStatus.PUBLISHED);
            for (Event e : featuredInDb) {
                boolean duplicate = response.stream().anyMatch(resp -> resp.getId().equals(e.getId()));
                if (!duplicate && e.getEndTime().isAfter(java.time.LocalDateTime.now())) {
                    response.add(eventMapper.toResponse(e));
                }
                if (response.size() >= 10) break;
            }
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public EventDetailResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
        return eventMapper.toDetailResponse(event);
    }

    @Override
    @Transactional
    public EventResponse createEvent(EventRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", request.getVenueId()));

        User manager = null;
        if (securityUtils.isCurrentUserManager()) {
            manager = userRepository.findById(securityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", securityUtils.getCurrentUserId()));
        }

        EventStatus initialStatus = (manager != null) ? EventStatus.PENDING_REVIEW : EventStatus.DRAFT;

        Event event = Event.builder()
                .venue(venue)
                .manager(manager)
                .title(request.getTitle())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .category(request.getCategory())
                .bannerUrl(request.getBannerUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .imageUrl(request.getImageUrl())
                .mapUrl(request.getMapUrl())
                .organizerName(request.getOrganizerName())
                .organizerDescription(request.getOrganizerDescription())
                .organizerLogoUrl(request.getOrganizerLogoUrl())
                .eventAddress(request.getEventAddress())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(initialStatus)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .build();

        event = eventRepository.save(event);
        return eventMapper.toResponse(event);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (securityUtils.isCurrentUserManager()) {
            if (event.getManager() == null || !event.getManager().getId().equals(securityUtils.getCurrentUserId())) {
                throw new AccessDeniedException("Bạn không có quyền sửa sự kiện này.");
            }
        }

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", request.getVenueId()));

        event.setVenue(venue);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setShortDescription(request.getShortDescription());
        event.setCategory(request.getCategory());
        event.setBannerUrl(request.getBannerUrl());
        event.setThumbnailUrl(request.getThumbnailUrl());
        event.setImageUrl(request.getImageUrl());
        event.setMapUrl(request.getMapUrl());
        event.setOrganizerName(request.getOrganizerName());
        event.setOrganizerDescription(request.getOrganizerDescription());
        event.setOrganizerLogoUrl(request.getOrganizerLogoUrl());
        event.setEventAddress(request.getEventAddress());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        if (request.getIsFeatured() != null) event.setIsFeatured(request.getIsFeatured());

        event = eventRepository.save(event);
        return eventMapper.toResponse(event);
    }

    @Override
    @Transactional
    public void updateEventStatus(Long id, EventStatus status) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (securityUtils.isCurrentUserManager()) {
            if (event.getManager() == null || !event.getManager().getId().equals(securityUtils.getCurrentUserId())) {
                throw new AccessDeniedException("Bạn không có quyền cập nhật sự kiện này.");
            }
            if (status == EventStatus.PUBLISHED) {
                throw new AccessDeniedException("Chỉ Admin mới có quyền xuất bản sự kiện. Sự kiện của bạn sẽ được Admin duyệt.");
            }
        }

        if (status == EventStatus.CANCELLED && event.getStatus() != EventStatus.CANCELLED) {
            List<BookingStatus> confirmedStatuses = java.util.Collections.singletonList(BookingStatus.CONFIRMED);
            List<Booking> affectedBookings = bookingRepository.findByEventIdAndStatusIn(id, confirmedStatuses);

            for (Booking b : affectedBookings) {
                if (b.getUser() != null) {
                    emailService.sendCancellationEmail(b.getUser().getEmail(), b.getUser().getFullName(), event.getTitle());
                }
            }
        }

        event.setStatus(status);
        eventRepository.save(event);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        if (securityUtils.isCurrentUserManager()) {
            if (event.getManager() == null || !event.getManager().getId().equals(securityUtils.getCurrentUserId())) {
                throw new AccessDeniedException("Bạn không có quyền xoá sự kiện này.");
            }
        }

        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EventResponse> getAllEvents(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Event> events;

        if (securityUtils.isCurrentUserManager()) {
            events = eventRepository.findByManagerId(securityUtils.getCurrentUserId(), pageRequest);
        } else {
            events = eventRepository.findAll(pageRequest);
        }

        return PageResponse.<EventResponse>builder()
                .content(events.getContent().stream().map(eventMapper::toResponse).collect(Collectors.toList()))
                .page(events.getNumber())
                .size(events.getSize())
                .totalElements(events.getTotalElements())
                .totalPages(events.getTotalPages())
                .last(events.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getSearchSuggestions() {
        java.time.LocalDateTime weakAgo = java.time.LocalDateTime.now().minusWeeks(1);
        return searchHistoryRepository.findTopKeywordsSince(weakAgo, PageRequest.of(0, 5));
    }

    @Override
    @Transactional
    public void logSearchKeyword(String keyword) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            com.eventbooking.entity.SearchHistory sh = com.eventbooking.entity.SearchHistory.builder()
                    .keyword(keyword.trim().toLowerCase())
                    .build();
            searchHistoryRepository.save(sh);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EventStatsResponse getEventStats(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        // Ticket categories breakdown
        List<TicketCategory> ticketCategories = ticketCategoryRepository.findByEventId(eventId);
        long totalSold = 0;
        long totalAvailable = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        List<EventStatsResponse.TicketSalesBreakdown> breakdown = new ArrayList<>();

        for (TicketCategory tc : ticketCategories) {
            int sold = tc.getSoldQuantity() != null ? tc.getSoldQuantity() : 0;
            int total = tc.getTotalQuantity() != null ? tc.getTotalQuantity() : 0;
            int remaining = tc.getRemainingQuantity() != null ? tc.getRemainingQuantity() : 0;
            BigDecimal revenue = tc.getPrice().multiply(BigDecimal.valueOf(sold));

            totalSold += sold;
            totalAvailable += total;
            totalRevenue = totalRevenue.add(revenue);

            breakdown.add(EventStatsResponse.TicketSalesBreakdown.builder()
                    .ticketCategoryId(tc.getId())
                    .ticketName(tc.getName())
                    .zoneName(tc.getZone() != null ? tc.getZone().getName() : "N/A")
                    .price(tc.getPrice())
                    .totalQuantity(total)
                    .soldQuantity(sold)
                    .remainingQuantity(remaining)
                    .revenue(revenue)
                    .build());
        }

        // Get confirmed bookings as attendees
        List<BookingStatus> attendeeStatuses = List.of(BookingStatus.CONFIRMED);
        List<Booking> confirmedBookings = bookingRepository.findByEventIdAndStatusIn(eventId, attendeeStatuses);

        long checkedInCount = confirmedBookings.stream()
                .filter(b -> Boolean.TRUE.equals(b.getIsCheckedIn()))
                .count();

        double attendanceRate = confirmedBookings.isEmpty() ? 0.0
                : BigDecimal.valueOf(checkedInCount)
                    .divide(BigDecimal.valueOf(confirmedBookings.size()), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();

        List<EventStatsResponse.AttendeeInfo> attendees = confirmedBookings.stream()
                .map(b -> {
                    String ticketDetails = b.getBookingDetails() != null ?
                            b.getBookingDetails().stream()
                                    .map(bd -> bd.getTicketCategory().getName() + " x" + bd.getQuantity())
                                    .collect(Collectors.joining(", "))
                            : "";
                    return EventStatsResponse.AttendeeInfo.builder()
                            .bookingId(b.getId())
                            .bookingCode(b.getBookingCode())
                            .fullName(b.getUser() != null ? b.getUser().getFullName() : "Khách")
                            .email(b.getUser() != null ? b.getUser().getEmail() : "")
                            .ticketCount(b.getTotalTickets() != null ? b.getTotalTickets() : 0)
                            .totalAmount(b.getTotalAmount())
                            .status(b.getStatus().name())
                            .isCheckedIn(b.getIsCheckedIn())
                            .ticketDetails(ticketDetails)
                            .build();
                })
                .collect(Collectors.toList());

        return EventStatsResponse.builder()
                .eventId(eventId)
                .eventTitle(event.getTitle())
                .totalTicketsSold(totalSold)
                .totalTicketsAvailable(totalAvailable)
                .totalRevenue(totalRevenue)
                .totalCheckedIn(checkedInCount)
                .attendanceRate(attendanceRate)
                .ticketBreakdown(breakdown)
                .attendees(attendees)
                .build();
    }
}
