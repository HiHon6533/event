package com.eventbooking.mapper;

import com.eventbooking.dto.response.EventDetailResponse;
import com.eventbooking.dto.response.EventResponse;
import com.eventbooking.entity.Event;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class EventMapper {

    private final VenueMapper venueMapper;
    private final TicketCategoryMapper ticketCategoryMapper;
    private final ZoneMapper zoneMapper;

    public EventMapper(VenueMapper venueMapper, TicketCategoryMapper ticketCategoryMapper, ZoneMapper zoneMapper) {
        this.venueMapper = venueMapper;
        this.ticketCategoryMapper = ticketCategoryMapper;
        this.zoneMapper = zoneMapper;
    }

    /** Lightweight response for list views */
    public EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .shortDescription(event.getShortDescription())
                .category(event.getCategory())
                .thumbnailUrl(event.getThumbnailUrl())
                .bannerUrl(event.getBannerUrl())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .isFeatured(event.getIsFeatured())
                .venueId(event.getVenue().getId())
                .venueName(event.getVenue().getName())
                .venueCity(event.getVenue().getCity())
                .managerId(event.getManager() != null ? event.getManager().getId() : null)
                .managerName(event.getManager() != null ? event.getManager().getFullName() : null)
                .createdAt(event.getCreatedAt())
                .build();
    }

    /** Full detail response with venue info and ticket categories */
    public EventDetailResponse toDetailResponse(Event event) {
        return EventDetailResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .shortDescription(event.getShortDescription())
                .category(event.getCategory())
                .bannerUrl(event.getBannerUrl())
                .thumbnailUrl(event.getThumbnailUrl())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .isFeatured(event.getIsFeatured())
                .venue(venueMapper.toResponse(event.getVenue()))
                .managerId(event.getManager() != null ? event.getManager().getId() : null)
                .managerName(event.getManager() != null ? event.getManager().getFullName() : null)
                .ticketCategories(event.getTicketCategories() != null
                        ? event.getTicketCategories().stream()
                            .map(ticketCategoryMapper::toResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .zones(event.getVenue() != null && event.getVenue().getZones() != null
                        ? event.getVenue().getZones().stream()
                            .filter(z -> Boolean.TRUE.equals(z.getIsActive()))
                            .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                            .map(zoneMapper::toResponse)
                            .collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
