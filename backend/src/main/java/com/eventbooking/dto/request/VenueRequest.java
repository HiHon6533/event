package com.eventbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VenueRequest {

    @NotBlank(message = "Tên địa điểm không được để trống")
    @Size(max = 200, message = "Tên tối đa 200 ký tự")
    private String name;

    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 20)
    private String phone;

    @Positive(message = "Sức chứa phải lớn hơn 0")
    private Integer totalCapacity;

    private String imageUrl;
    private String description;
}
