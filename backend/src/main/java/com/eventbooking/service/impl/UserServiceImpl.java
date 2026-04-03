package com.eventbooking.service.impl;

import com.eventbooking.dto.request.OrganizerRequest;
import com.eventbooking.dto.request.UpdateProfileRequest;
import com.eventbooking.dto.response.OrganizerRegistrationResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.dto.response.UserResponse;
import com.eventbooking.entity.OrganizerRegistration;
import com.eventbooking.entity.User;
import com.eventbooking.entity.enums.OrganizerRequestStatus;
import com.eventbooking.entity.enums.UserRole;
import com.eventbooking.exception.BadRequestException;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.UserMapper;
import com.eventbooking.repository.OrganizerRegistrationRepository;
import com.eventbooking.repository.UserRepository;
import com.eventbooking.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dịch vụ xử lý Người dùng: Hồ sơ cá nhân, Luồng đăng ký nâng cấp Nhà tổ chức (Manager) và kiểm duyệt của Admin.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrganizerRegistrationRepository organizerRegistrationRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository,
                          OrganizerRegistrationRepository organizerRegistrationRepository,
                          UserMapper userMapper) {
        this.userRepository = userRepository;
        this.organizerRegistrationRepository = organizerRegistrationRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = findUserById(userId);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUserById(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(int page, int size) {
        Page<User> usersPage = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.<UserResponse>builder()
                .content(usersPage.getContent().stream().map(userMapper::toResponse).toList())
                .page(usersPage.getNumber())
                .size(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .last(usersPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userMapper.toResponse(findUserById(id));
    }

    @Override
    @Transactional
    public UserResponse changeUserRole(Long id, UserRole role) {
        User user = findUserById(id);
        if (user.getRole() == UserRole.ADMIN && role != UserRole.ADMIN) {
            // Prevent removing the last admin
            long adminCount = userRepository.countByRole(UserRole.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Không thể thay đổi vai trò của admin cuối cùng trong hệ thống");
            }
        }
        user.setRole(role);
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = findUserById(id);
        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Không thể khóa tài khoản Admin");
        }
        user.setIsActive(!user.getIsActive());
        user = userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findUserById(id);
        user.setIsActive(false);
        userRepository.save(user);
    }

    // ── Organizer Registration ──────────────────────────────

    @Override
    @Transactional
    public Map<String, String> registerOrganizer(Long userId, OrganizerRequest request) {
        User user = findUserById(userId);

        if (user.getRole() == UserRole.MANAGER || user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Bạn đã có quyền tổ chức sự kiện");
        }

        // Validate profile is complete before registration
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            throw new BadRequestException("Vui lòng cập nhật Họ và tên trong Hồ sơ cá nhân trước khi đăng ký Ban tổ chức.");
        }
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            throw new BadRequestException("Vui lòng cập nhật Số điện thoại trong Hồ sơ cá nhân trước khi đăng ký Ban tổ chức.");
        }

        // Check if there's already a pending request
        if (organizerRegistrationRepository.existsByUserIdAndStatus(userId, OrganizerRequestStatus.PENDING)) {
            throw new BadRequestException("Bạn đã có yêu cầu đang chờ duyệt. Vui lòng chờ Admin xử lý.");
        }

        OrganizerRegistration registration = OrganizerRegistration.builder()
                .user(user)
                .organizationName(request.getOrganizationName())
                .description(request.getDescription())
                .phone(request.getPhone())
                .status(OrganizerRequestStatus.PENDING)
                .build();

        organizerRegistrationRepository.save(registration);

        return Map.of("message", "Yêu cầu đăng ký Ban tổ chức đã được gửi. Vui lòng chờ Admin duyệt.");
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizerRegistrationResponse getOrganizerStatus(Long userId) {
        OrganizerRegistration reg = organizerRegistrationRepository
                .findByUserIdAndStatus(userId, OrganizerRequestStatus.PENDING)
                .orElse(null);
        if (reg == null) {
            return null;
        }
        return toOrganizerResponse(reg);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrganizerRegistrationResponse> getOrganizerRequests(int page, int size, String status) {
        Page<OrganizerRegistration> regsPage;
        PageRequest pageRequest = PageRequest.of(page, size);

        if (status != null && !status.isEmpty()) {
            OrganizerRequestStatus reqStatus = OrganizerRequestStatus.valueOf(status.toUpperCase());
            regsPage = organizerRegistrationRepository.findByStatusOrderByCreatedAtDesc(reqStatus, pageRequest);
        } else {
            regsPage = organizerRegistrationRepository.findAllByOrderByCreatedAtDesc(pageRequest);
        }

        return PageResponse.<OrganizerRegistrationResponse>builder()
                .content(regsPage.getContent().stream().map(this::toOrganizerResponse).collect(Collectors.toList()))
                .page(regsPage.getNumber())
                .size(regsPage.getSize())
                .totalElements(regsPage.getTotalElements())
                .totalPages(regsPage.getTotalPages())
                .last(regsPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getPendingOrganizerCount() {
        long count = organizerRegistrationRepository.countByStatus(OrganizerRequestStatus.PENDING);
        return Map.of("count", count);
    }

    @Override
    @Transactional
    public Map<String, String> approveOrganizer(Long requestId) {
        OrganizerRegistration reg = organizerRegistrationRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("OrganizerRegistration", "id", requestId));

        if (reg.getStatus() != OrganizerRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý trước đó");
        }

        reg.setStatus(OrganizerRequestStatus.APPROVED);
        organizerRegistrationRepository.save(reg);

        // Upgrade user role to MANAGER
        User user = reg.getUser();
        user.setRole(UserRole.MANAGER);
        userRepository.save(user);

        return Map.of("message", "Đã duyệt yêu cầu. Người dùng " + user.getFullName() + " đã được nâng cấp thành Ban tổ chức.");
    }

    @Override
    @Transactional
    public Map<String, String> rejectOrganizer(Long requestId, String note) {
        OrganizerRegistration reg = organizerRegistrationRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("OrganizerRegistration", "id", requestId));

        if (reg.getStatus() != OrganizerRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý trước đó");
        }

        reg.setStatus(OrganizerRequestStatus.REJECTED);
        reg.setAdminNote(note);
        organizerRegistrationRepository.save(reg);

        return Map.of("message", "Đã từ chối yêu cầu đăng ký Ban tổ chức.");
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private OrganizerRegistrationResponse toOrganizerResponse(OrganizerRegistration reg) {
        return OrganizerRegistrationResponse.builder()
                .id(reg.getId())
                .userId(reg.getUser().getId())
                .userFullName(reg.getUser().getFullName())
                .userEmail(reg.getUser().getEmail())
                .organizationName(reg.getOrganizationName())
                .description(reg.getDescription())
                .phone(reg.getPhone())
                .status(reg.getStatus().name())
                .adminNote(reg.getAdminNote())
                .createdAt(reg.getCreatedAt())
                .build();
    }
}
