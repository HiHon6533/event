package com.eventbooking.dto.response;

import com.eventbooking.entity.enums.EventCategory;
import com.eventbooking.entity.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String shortDescription;
    private EventCategory category;
    private String bannerUrl;
    private String thumbnailUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private Boolean isFeatured;
    private VenueResponse venue;
    private Long managerId;
    private String managerName;
    private List<TicketCategoryResponse> ticketCategories;
    private LocalDateTime createdAt;
}
