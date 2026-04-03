package com.eventbooking.mapper;

import com.eventbooking.dto.response.BookingDetailResponse;
import com.eventbooking.dto.response.BookingResponse;
import com.eventbooking.entity.Booking;
import com.eventbooking.entity.BookingDetail;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class BookingMapper {

    private final PaymentMapper paymentMapper;

    public BookingMapper(PaymentMapper paymentMapper) {
        this.paymentMapper = paymentMapper;
    }

    public BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser().getId())
                .userFullName(booking.getUser().getFullName())
                .userEmail(booking.getUser().getEmail())
                .eventId(booking.getEvent().getId())
                .eventTitle(booking.getEvent().getTitle())
                .totalTickets(booking.getTotalTickets())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .qrSecretToken(booking.getQrSecretToken())
                .isCheckedIn(booking.getIsCheckedIn())
                .note(booking.getNote())
                .bookingDate(booking.getBookingDate())
                .eventDate(booking.getEventDate())
                .bookingDetails(booking.getBookingDetails() != null
                        ? booking.getBookingDetails().stream()
                            .map(this::toDetailResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .payment(booking.getPayment() != null
                        ? paymentMapper.toResponse(booking.getPayment()) : null)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public BookingDetailResponse toDetailResponse(BookingDetail detail) {
        return BookingDetailResponse.builder()
                .id(detail.getId())
                .ticketCategoryId(detail.getTicketCategory().getId())
                .ticketCategoryName(detail.getTicketCategory().getName())
                .zoneName(detail.getTicketCategory().getZone().getName())
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .subtotal(detail.getSubtotal())
                .build();
    }
}
