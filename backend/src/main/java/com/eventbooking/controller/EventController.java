package com.eventbooking.controller;

import com.eventbooking.dto.request.EventRequest;
import com.eventbooking.dto.response.EventDetailResponse;
import com.eventbooking.dto.response.EventResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.entity.enums.EventCategory;
import com.eventbooking.entity.enums.EventStatus;
import com.eventbooking.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /** Public: get published events with optional category filter and keyword search */
    @GetMapping
    public ResponseEntity<PageResponse<EventResponse>> getPublishedEvents(
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            eventService.logSearchKeyword(keyword);
        }
        return ResponseEntity.ok(eventService.getPublishedEvents(category, keyword, page, size));
    }

    /** Public: get featured events */
    @GetMapping("/featured")
    public ResponseEntity<List<EventResponse>> getFeaturedEvents() {
        return ResponseEntity.ok(eventService.getFeaturedEvents());
    }

    /** Public: get search suggestions */
    @GetMapping("/search-suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions() {
        return ResponseEntity.ok(eventService.getSearchSuggestions());
    }

    /** Public: get all events (any status) */
    @GetMapping("/all")
    public ResponseEntity<PageResponse<EventResponse>> getAllEventsPublic(
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            eventService.logSearchKeyword(keyword);
        }
        return ResponseEntity.ok(eventService.getAllEventsPublic(category, keyword, page, size));
    }

    /** Public: get event detail */
    @GetMapping("/{id}")
    public ResponseEntity<EventDetailResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    /** Admin: create event */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request));
    }

    /** Admin: update event */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id,
                                                      @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(id, request));
    }

    /** Admin: update event status */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> updateEventStatus(@PathVariable Long id,
                                                   @RequestParam EventStatus status) {
        eventService.updateEventStatus(id, status);
        return ResponseEntity.ok().build();
    }

    /** Admin: delete (cancel) event */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    /** Admin: get all events (any status) */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PageResponse<EventResponse>> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(eventService.getAllEvents(page, size));
    }
}
