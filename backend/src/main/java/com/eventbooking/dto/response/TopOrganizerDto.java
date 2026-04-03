package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TopOrganizerDto {
    private Long id;
    private String fullName;
    private String email;
    private Long totalEvents;
    private Long totalTickets;
    private BigDecimal totalRevenue;
}
