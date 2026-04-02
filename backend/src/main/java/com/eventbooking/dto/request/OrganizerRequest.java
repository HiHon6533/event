package com.eventbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrganizerRequest {

    @NotBlank(message = "Tên tổ chức không được để trống")
    @Size(max = 200, message = "Tên tổ chức tối đa 200 ký tự")
    private String organizationName;

    @Size(max = 2000, message = "Mô tả tối đa 2000 ký tự")
    private String description;

    @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
    private String phone;
}
