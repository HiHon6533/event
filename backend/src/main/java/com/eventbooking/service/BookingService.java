package com.eventbooking.service;

import com.eventbooking.dto.request.BookingRequest;
import com.eventbooking.dto.response.BookingResponse;
import com.eventbooking.dto.response.PageResponse;

public interface BookingService {
    BookingResponse createBooking(Long userId, BookingRequest request);
    BookingResponse getBookingById(Long id, Long userId);
    PageResponse<BookingResponse> getMyBookings(Long userId, int page, int size);
    void cancelBooking(Long id, Long userId);
    PageResponse<BookingResponse> getAllBookings(int page, int size);
    String getBookingQrCode(Long id, Long userId);
}
