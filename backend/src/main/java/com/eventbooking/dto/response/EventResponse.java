package com.eventbooking.dto.response;

import com.eventbooking.entity.enums.EventCategory;
import com.eventbooking.entity.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventResponse {
    private Long id;
    private String title;
    private String shortDescription;
    private EventCategory category;
    private String thumbnailUrl;
    private String bannerUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private Boolean isFeatured;
    private Boolean isSoldOut;
    private Double minPrice;
    private Long venueId;
    private String venueName;
    private String venueCity;
    private Long managerId;
    private String managerName;
    private LocalDateTime createdAt;
}
