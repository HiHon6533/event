package com.eventbooking.service;

import com.eventbooking.dto.request.PaymentRequest;
import com.eventbooking.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(Long userId, PaymentRequest request);
    PaymentResponse getPaymentByBookingId(Long bookingId);
}
