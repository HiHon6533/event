package com.eventbooking.controller;

import com.eventbooking.dto.request.CreateEventCancellationRequest;
import com.eventbooking.dto.response.EventCancellationResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.service.EventCancellationService;
import com.eventbooking.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/event-cancellations")
public class EventCancellationController {

    private final EventCancellationService cancellationService;
    private final SecurityUtils securityUtils;

    public EventCancellationController(EventCancellationService cancellationService, SecurityUtils securityUtils) {
        this.cancellationService = cancellationService;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/stats/{eventId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> getCancellationStats(@PathVariable Long eventId) {
        return ResponseEntity.ok(cancellationService.getCancellationStats(eventId));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<EventCancellationResponse> requestCancellation(@RequestBody @Valid CreateEventCancellationRequest request) {
        Long managerId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(cancellationService.requestCancellation(managerId, request));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventCancellationResponse> reviewRequest(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(cancellationService.reviewRequest(id, approved, note));
    }

    @PostMapping("/{id}/execute")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<EventCancellationResponse> executeRefund(@PathVariable Long id) {
        Long managerId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(cancellationService.executeRefund(managerId, id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PageResponse<EventCancellationResponse>> getRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(cancellationService.getRequests(page, size, status));
    }
}
