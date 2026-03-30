package com.eventbooking.dto.response;

import com.eventbooking.entity.enums.PaymentMethod;
import com.eventbooking.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String transactionId;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;
}
