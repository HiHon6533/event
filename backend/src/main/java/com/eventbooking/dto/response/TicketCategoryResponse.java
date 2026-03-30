package com.eventbooking.dto.response;

import com.eventbooking.entity.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketCategoryResponse {
    private Long id;
    private Long eventId;
    private Long zoneId;
    private String zoneName;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer totalQuantity;
    private Integer soldQuantity;
    private Integer availableQuantity;
    private Integer maxPerBooking;
    private TicketStatus status;
}
