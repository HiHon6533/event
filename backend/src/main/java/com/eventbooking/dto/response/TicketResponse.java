package com.eventbooking.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import com.eventbooking.entity.enums.TicketStatus;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private Long eventId;
    private Long zoneId;
    private String zoneName;
    private Long seatId;
    private String rowLabel;
    private String seatNumber;
    private BigDecimal price;
    private BigDecimal dealScore;
    private TicketStatus status;
}
