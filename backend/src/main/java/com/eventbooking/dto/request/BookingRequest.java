package com.eventbooking.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BookingRequest {

    @NotNull(message = "Event ID không được để trống")
    private Long eventId;

    @NotEmpty(message = "Danh sách vé không được để trống")
    @Valid
    private List<BookingDetailRequest> items;

    private String note;
}
