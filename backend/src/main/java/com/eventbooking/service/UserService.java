package com.eventbooking.service;

import com.eventbooking.dto.request.UpdateProfileRequest;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.dto.response.UserResponse;

public interface UserService {
    UserResponse getCurrentUser(Long userId);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
    PageResponse<UserResponse> getAllUsers(int page, int size);
    UserResponse getUserById(Long id);
    void deleteUser(Long id);
}
