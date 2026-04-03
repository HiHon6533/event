package com.eventbooking.controller;

import com.eventbooking.dto.request.BookingRequest;
import com.eventbooking.dto.response.BookingResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.security.CustomUserDetails;
import com.eventbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller xử lý các API liên quan đến đơn đặt vé (Booking) của người dùng và Admin.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(userDetails.getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id, userDetails.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<PageResponse<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(bookingService.getMyBookings(userDetails.getId(), page, size));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        bookingService.cancelBooking(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/qrcode")
    public ResponseEntity<Map<String, String>> getQrCode(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        String qrCode = bookingService.getBookingQrCode(id, userDetails.getId());
        return ResponseEntity.ok(Map.of("qrCode", qrCode));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PageResponse<BookingResponse>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(bookingService.getAllBookings(page, size));
    }
}
