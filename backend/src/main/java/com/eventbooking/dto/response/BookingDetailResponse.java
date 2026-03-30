package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingDetailResponse {
    private Long id;
    private Long ticketCategoryId;
    private String ticketCategoryName;
    private String zoneName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
