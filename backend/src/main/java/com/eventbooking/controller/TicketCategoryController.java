package com.eventbooking.controller;

import com.eventbooking.dto.request.TicketCategoryRequest;
import com.eventbooking.dto.response.TicketCategoryResponse;
import com.eventbooking.service.TicketCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý Danh mục vé (Ví dụ: VIP, VVIP, Standard) và cấu hình giá vé.
 */
@RestController
@RequestMapping("/api/ticket-categories")
public class TicketCategoryController {

    private final TicketCategoryService ticketCategoryService;

    public TicketCategoryController(TicketCategoryService ticketCategoryService) {
        this.ticketCategoryService = ticketCategoryService;
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TicketCategoryResponse>> getByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketCategoryService.getByEventId(eventId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TicketCategoryResponse> createTicketCategory(
            @Valid @RequestBody TicketCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketCategoryService.createTicketCategory(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TicketCategoryResponse> updateTicketCategory(
            @PathVariable Long id, @Valid @RequestBody TicketCategoryRequest request) {
        return ResponseEntity.ok(ticketCategoryService.updateTicketCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTicketCategory(@PathVariable Long id) {
        ticketCategoryService.deleteTicketCategory(id);
        return ResponseEntity.noContent().build();
    }
}
