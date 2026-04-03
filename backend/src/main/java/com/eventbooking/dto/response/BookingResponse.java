package com.eventbooking.dto.response;

import com.eventbooking.entity.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Long eventId;
    private String eventTitle;
    private Integer totalTickets;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private String qrSecretToken;
    private Boolean isCheckedIn;
    private String note;
    private LocalDateTime bookingDate;
    private LocalDateTime eventDate;
    private List<BookingDetailResponse> bookingDetails;
    private PaymentResponse payment;
    private LocalDateTime createdAt;
}
