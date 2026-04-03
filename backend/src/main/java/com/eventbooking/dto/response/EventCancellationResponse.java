package com.eventbooking.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class EventCancellationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String reason;
    private Long totalTicketsSold;
    private BigDecimal totalRefundAmount;
    private String status;
    private String adminNote;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}
