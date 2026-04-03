package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TopEventDto {
    private Long id;
    private String title;
    private String category;
    private String imageUrl;
    private Long totalTickets;
    private BigDecimal totalRevenue;
}
