package com.eventbooking.service;

import com.eventbooking.dto.request.OrganizerRequest;
import com.eventbooking.dto.request.UpdateProfileRequest;
import com.eventbooking.dto.response.OrganizerRegistrationResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.dto.response.UserResponse;
import com.eventbooking.entity.enums.UserRole;

import java.util.Map;

public interface UserService {
    UserResponse getCurrentUser(Long userId);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
    PageResponse<UserResponse> getAllUsers(int page, int size);
    UserResponse getUserById(Long id);
    UserResponse changeUserRole(Long id, UserRole role);
    UserResponse toggleUserStatus(Long id);
    void deleteUser(Long id);

    // Organizer registration
    Map<String, String> registerOrganizer(Long userId, OrganizerRequest request);
    OrganizerRegistrationResponse getOrganizerStatus(Long userId);
    PageResponse<OrganizerRegistrationResponse> getOrganizerRequests(int page, int size, String status);
    Map<String, Long> getPendingOrganizerCount();
    Map<String, String> approveOrganizer(Long requestId);
    Map<String, String> rejectOrganizer(Long requestId, String note);
}
