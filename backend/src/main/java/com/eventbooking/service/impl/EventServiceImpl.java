package com.eventbooking.service.impl;

import com.eventbooking.dto.request.EventRequest;
import com.eventbooking.dto.response.EventDetailResponse;
import com.eventbooking.dto.response.EventResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.entity.Event;
import com.eventbooking.entity.Venue;
import com.eventbooking.entity.enums.EventCategory;
import com.eventbooking.entity.enums.EventStatus;
import com.eventbooking.entity.User;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.EventMapper;
import com.eventbooking.repository.EventRepository;
import com.eventbooking.repository.UserRepository;
import com.eventbooking.repository.VenueRepository;
import com.eventbooking.security.SecurityUtils;
import com.eventbooking.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final com.eventbooking.repository.SearchHistoryRepository searchHistoryRepository;
    private final com.eventbooking.repository.BookingRepository bookingRepository;
    private final com.eventbooking.service.EmailService emailService;
    private final EventMapper eventMapper;
    private final SecurityUtils securityUtils;

    public EventServiceImpl(EventRepository eventRepository, VenueRepository venueRepository,
                           UserRepository userRepository, com.eventbooking.repository.SearchHistoryRepository searchHistoryRepository, 
                           com.eventbooking.repository.BookingRepository bookingRepository, com.eventbooking.service.EmailService emailService,
                           EventMapper eventMapper, SecurityUtils securityUtils) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.bookingRepository = bookingRepository;
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

        if (keyword != null && !keyword.isEmpty() || category != null) {
            events = eventRepository.searchEvents(EventStatus.PUBLISHED, category, keyword, pageRequest);
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

        if ((keyword != null && !keyword.isEmpty()) || category != null) {
            events = eventRepository.searchAllEvents(category, keyword, pageRequest);
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
        return eventRepository.findByIsFeaturedTrueAndStatus(EventStatus.PUBLISHED).stream()
                .map(eventMapper::toResponse)
                .collect(Collectors.toList());
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

        Event event = Event.builder()
                .venue(venue)
                .manager(manager)
                .title(request.getTitle())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .category(request.getCategory())
                .bannerUrl(request.getBannerUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .mapUrl(request.getMapUrl())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(EventStatus.DRAFT) // create as draft so admin can review and publish later
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
        event.setMapUrl(request.getMapUrl());
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
        }

        if (status == EventStatus.CANCELLED && event.getStatus() != EventStatus.CANCELLED) {
            java.util.List<com.eventbooking.entity.enums.BookingStatus> confirmedStatuses = java.util.Collections.singletonList(
                    com.eventbooking.entity.enums.BookingStatus.CONFIRMED);
            java.util.List<com.eventbooking.entity.Booking> affectedBookings = bookingRepository.findByEventIdAndStatusIn(id, confirmedStatuses);
            
            for (com.eventbooking.entity.Booking b : affectedBookings) {
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
}
