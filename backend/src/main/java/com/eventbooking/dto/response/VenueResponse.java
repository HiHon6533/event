package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class VenueResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String phone;
    private Integer totalCapacity;
    private String imageUrl;
    private String seatMapImage;
    private String description;
    private Boolean isActive;
    private List<ZoneResponse> zones;
    private LocalDateTime createdAt;
}
