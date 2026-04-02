package com.eventbooking.dto.request;

import com.eventbooking.entity.enums.EventCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {

    @NotNull(message = "Venue ID không được để trống")
    private Long venueId;

    @NotBlank(message = "Tên sự kiện không được để trống")
    private String title;

    private String description;
    private String shortDescription;

    @NotNull(message = "Danh mục sự kiện không được để trống")
    private EventCategory category;

    private String bannerUrl;
    private String thumbnailUrl;
    private String mapUrl;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;

    private Boolean isFeatured;
}
