package com.eventbooking.dto.request;

import com.eventbooking.entity.enums.ZoneType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ZoneRequest {

    @NotNull(message = "Venue ID không được để trống")
    private Long venueId;

    @NotBlank(message = "Tên khu vực không được để trống")
    private String name;

    private String description;
    
    @NotNull(message = "Loại khu vực không được để trống")
    private ZoneType type;

    @NotNull(message = "Sức chứa không được để trống")
    @Positive(message = "Sức chứa phải lớn hơn 0")
    private Integer capacity;

    private Integer sortOrder;
}
