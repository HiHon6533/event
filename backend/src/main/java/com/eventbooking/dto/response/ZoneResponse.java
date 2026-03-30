package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ZoneResponse {
    private Long id;
    private Long venueId;
    private String venueName;
    private String name;
    private String description;
    private Integer capacity;
    private Integer sortOrder;
    private Boolean isActive;
}
