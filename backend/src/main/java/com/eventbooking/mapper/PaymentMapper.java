package com.eventbooking.mapper;

import com.eventbooking.dto.response.PaymentResponse;
import com.eventbooking.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .paymentTime(payment.getPaymentTime())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
