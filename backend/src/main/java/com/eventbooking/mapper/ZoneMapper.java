package com.eventbooking.mapper;

import com.eventbooking.dto.response.ZoneResponse;
import com.eventbooking.entity.Zone;
import org.springframework.stereotype.Component;

@Component
public class ZoneMapper {

    public ZoneResponse toResponse(Zone zone) {
        return ZoneResponse.builder()
                .id(zone.getId())
                .venueId(zone.getVenue().getId())
                .venueName(zone.getVenue().getName())
                .name(zone.getName())
                .description(zone.getDescription())
                .type(zone.getType() != null ? zone.getType().name() : null)
                .capacity(zone.getCapacity())
                .sortOrder(zone.getSortOrder())
                .isActive(zone.getIsActive())
                .build();
    }
}
