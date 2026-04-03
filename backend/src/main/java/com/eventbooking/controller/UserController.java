package com.eventbooking.controller;

import com.eventbooking.dto.request.OrganizerRequest;
import com.eventbooking.dto.request.UpdateProfileRequest;
import com.eventbooking.dto.response.OrganizerRegistrationResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.dto.response.UserResponse;
import com.eventbooking.entity.enums.UserRole;
import com.eventbooking.security.CustomUserDetails;
import com.eventbooking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller quản lý tài khoản Người dùng: Cập nhật hồ sơ, đăng ký nâng cấp thành Nhà tổ chức và Quyền Admin quản lý User.
 */
@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ── Current User ─────────────────────────────────────

    @GetMapping("/users/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getCurrentUser(userDetails.getId()));
    }

    @PutMapping("/users/me")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                       @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    // ── Organizer Registration (User) ────────────────────

    @PostMapping("/users/register-organizer")
    public ResponseEntity<Map<String, String>> registerOrganizer(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody OrganizerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.registerOrganizer(userDetails.getId(), request));
    }

    @GetMapping("/users/organizer-status")
    public ResponseEntity<OrganizerRegistrationResponse> getOrganizerStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getOrganizerStatus(userDetails.getId()));
    }

    // ── Admin: User Management ───────────────────────────

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.getAllUsers(page, size));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> changeUserRole(@PathVariable Long id,
                                                        @RequestParam UserRole role) {
        return ResponseEntity.ok(userService.changeUserRole(id, role));
    }

    @PatchMapping("/admin/users/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ── Admin: Organizer Request Management ──────────────

    @GetMapping("/admin/organizer-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<OrganizerRegistrationResponse>> getOrganizerRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(userService.getOrganizerRequests(page, size, status));
    }

    @GetMapping("/admin/organizer-requests/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingOrganizerCount() {
        return ResponseEntity.ok(userService.getPendingOrganizerCount());
    }

    @PatchMapping("/admin/organizer-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> approveOrganizer(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveOrganizer(id));
    }

    @PatchMapping("/admin/organizer-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> rejectOrganizer(@PathVariable Long id,
                                                                 @RequestParam(required = false) String note) {
        return ResponseEntity.ok(userService.rejectOrganizer(id, note));
    }
}
