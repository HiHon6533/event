package com.eventbooking.mapper;

import com.eventbooking.dto.response.TicketCategoryResponse;
import com.eventbooking.entity.TicketCategory;
import org.springframework.stereotype.Component;

@Component
public class TicketCategoryMapper {

    public TicketCategoryResponse toResponse(TicketCategory tc) {
        return TicketCategoryResponse.builder()
                .id(tc.getId())
                .eventId(tc.getEvent().getId())
                .zoneId(tc.getZone().getId())
                .zoneName(tc.getZone().getName())
                .name(tc.getName())
                .description(tc.getDescription())
                .price(tc.getPrice())
                .totalQuantity(tc.getTotalQuantity())
                .soldQuantity(tc.getSoldQuantity())
                .availableQuantity(tc.getAvailableQuantity())
                .maxPerBooking(tc.getMaxPerBooking())
                .status(tc.getStatus())
                .build();
    }
}
