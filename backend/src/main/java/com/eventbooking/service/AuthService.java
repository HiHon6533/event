package com.eventbooking.service;

import com.eventbooking.dto.request.*;
import com.eventbooking.dto.response.AuthResponse;

import java.util.Map;

public interface AuthService {
    Map<String, String> register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse verifyEmail(VerifyOtpRequest request);
    Map<String, String> resendOtp(ForgotPasswordRequest request);
    Map<String, String> forgotPassword(ForgotPasswordRequest request);
    Map<String, String> resetPassword(ResetPasswordRequest request);
}

