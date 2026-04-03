package com.eventbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateEventCancellationRequest {
    @NotNull(message = "Mã sự kiện không được trống")
    private Long eventId;
    
    @NotBlank(message = "Lý do hủy không được trống")
    private String reason;
}
