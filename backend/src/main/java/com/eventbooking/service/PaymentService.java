package com.eventbooking.service;

import com.eventbooking.dto.request.PaymentRequest;
import com.eventbooking.dto.response.PaymentResponse;

import com.eventbooking.dto.response.PageResponse;

public interface PaymentService {
    PaymentResponse processPayment(Long userId, PaymentRequest request);
    PaymentResponse getPaymentByBookingId(Long bookingId);
    PageResponse<PaymentResponse> getAllPayments(int page, int size);
}
