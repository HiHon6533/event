package com.eventbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TicketCategoryRequest {

    @NotNull(message = "Event ID không được để trống")
    private Long eventId;

    @NotNull(message = "Zone ID không được để trống")
    private Long zoneId;

    @NotBlank(message = "Tên hạng vé không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá vé không được để trống")
    @Positive(message = "Giá vé phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "Số lượng không được để trống")
    @Positive(message = "Số lượng phải lớn hơn 0")
    private Integer totalQuantity;

    @Positive(message = "Số vé tối đa mỗi đơn phải lớn hơn 0")
    private Integer maxPerBooking;
}
