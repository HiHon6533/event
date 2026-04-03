package com.eventbooking.service.impl;

import com.eventbooking.dto.request.*;
import com.eventbooking.dto.response.AuthResponse;
import com.eventbooking.dto.response.UserResponse;
import com.eventbooking.entity.User;
import com.eventbooking.entity.enums.UserRole;
import com.eventbooking.exception.BadRequestException;
import com.eventbooking.exception.DuplicateResourceException;
import com.eventbooking.mapper.UserMapper;
import com.eventbooking.repository.UserRepository;
import com.eventbooking.security.JwtTokenProvider;
import com.eventbooking.service.AuthService;
import com.eventbooking.service.EmailService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

/**
 * Dịch vụ xử lý logic xác thực người dùng: Đăng ký, Đăng nhập (với JWT), kích hoạt tài khoản bằng OTP và quên mật khẩu.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final EmailService emailService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider,
                          UserMapper userMapper, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
        this.emailService = emailService;
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    @Override
    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            // Nếu user đã tồn tại nhưng chưa kích hoạt, cho phép gửi lại OTP
            User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (existingUser != null && !existingUser.getIsActive()) {
                String otp = generateOtp();
                existingUser.setOtpCode(otp);
                existingUser.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
                existingUser.setFullName(request.getFullName());
                existingUser.setPhone(request.getPhone());
                existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(existingUser);
                emailService.sendOtpEmail(request.getEmail(), request.getFullName(), otp, "REGISTER");
                return Map.of("message", "Mã OTP đã được gửi lại đến email của bạn", "email", request.getEmail());
            }
            throw new DuplicateResourceException("Email đã được sử dụng: " + request.getEmail());
        }

        String otp = generateOtp();

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.USER)
                .isActive(false) // Chưa kích hoạt, chờ xác thực OTP
                .otpCode(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(5))
                .build();

        userRepository.save(user);

        // Gửi email OTP
        emailService.sendOtpEmail(request.getEmail(), request.getFullName(), otp, "REGISTER");

        return Map.of("message", "Vui lòng kiểm tra email để nhận mã OTP xác thực", "email", request.getEmail());
    }

    @Override
    @Transactional
    public AuthResponse verifyEmail(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        if (user.getIsActive()) {
            throw new BadRequestException("Tài khoản đã được kích hoạt trước đó");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtpCode())) {
            throw new BadRequestException("Mã OTP không chính xác");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại");
        }

        // Kích hoạt tài khoản
        user.setIsActive(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Tạo token trực tiếp cho user đã verify (không cần authenticate bằng password)
        String token = tokenProvider.generateTokenFromEmail(user.getEmail(), user.getId(), user.getRole().name());
        UserResponse userResponse = userMapper.toResponse(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public Map<String, String> resendOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        if (user.getIsActive()) {
            throw new BadRequestException("Tài khoản đã được kích hoạt trước đó");
        }

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(request.getEmail(), user.getFullName(), otp, "REGISTER");

        return Map.of("message", "Mã OTP đã được gửi lại đến email của bạn");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không chính xác"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = tokenProvider.generateToken(authentication);
        UserResponse userResponse = userMapper.toResponse(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(request.getEmail(), user.getFullName(), otp, "RESET");

        return Map.of("message", "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn");
    }

    @Override
    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtpCode())) {
            throw new BadRequestException("Mã OTP không chính xác");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return Map.of("message", "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập");
    }
}
