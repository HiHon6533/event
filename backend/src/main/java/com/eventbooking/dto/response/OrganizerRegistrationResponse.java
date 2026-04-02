package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrganizerRegistrationResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String organizationName;
    private String description;
    private String phone;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
}
