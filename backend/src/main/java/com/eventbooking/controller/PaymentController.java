package com.eventbooking.controller;

import com.eventbooking.dto.request.PaymentRequest;
import com.eventbooking.dto.response.PaymentResponse;
import com.eventbooking.security.CustomUserDetails;
import com.eventbooking.service.PaymentService;
import com.eventbooking.service.VNPayService;
import com.eventbooking.entity.Booking;
import com.eventbooking.entity.enums.BookingStatus;
import com.eventbooking.entity.enums.PaymentStatus;
import com.eventbooking.entity.Payment;
import com.eventbooking.repository.BookingRepository;
import com.eventbooking.repository.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayService vnPayService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentService paymentService, VNPayService vnPayService,
                            BookingRepository bookingRepository, PaymentRepository paymentRepository) {
        this.paymentService = paymentService;
        this.vnPayService = vnPayService;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/create-vnpay-url")
    public ResponseEntity<Map<String, String>> createVnPayUrl(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Long> request,
            HttpServletRequest httpRequest) {
        Long bookingId = request.get("bookingId");
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt vé"));

        if (!booking.getUser().getId().equals(userDetails.getId())) {
            throw new RuntimeException("Bạn không có quyền thanh toán đơn này");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Đơn đặt vé không ở trạng thái chờ thanh toán");
        }

        String ipAddress = httpRequest.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }

        String orderInfo = "Thanh toan ve su kien - Ma " + booking.getBookingCode();
        String paymentUrl = vnPayService.createPaymentUrl(
                bookingId, booking.getTotalAmount().longValue(), orderInfo, ipAddress);

        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Map<String, String>> vnpayReturn(@RequestParam Map<String, String> params) {
        boolean isValid = vnPayService.validateSignature(params);
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpTxnRef = params.get("vnp_TxnRef");

        // Lấy bookingId từ vnp_TxnRef (format: bookingId_timestamp)
        Long bookingId = Long.parseLong(vnpTxnRef.split("_")[0]);
        Booking booking = bookingRepository.findById(bookingId).orElse(null);

        if (isValid && "00".equals(vnpResponseCode) && booking != null) {
            // Thanh toán thành công
            if (booking.getStatus() == BookingStatus.PENDING) {
                Payment payment = Payment.builder()
                        .booking(booking)
                        .amount(booking.getTotalAmount())
                        .paymentMethod(com.eventbooking.entity.enums.PaymentMethod.VNPAY)
                        .transactionId(params.get("vnp_TransactionNo"))
                        .status(PaymentStatus.SUCCESS)
                        .paymentDate(LocalDateTime.now())
                        .build();
                paymentRepository.save(payment);

                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setPayment(payment);
                bookingRepository.save(booking);
            }
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Thanh toán thành công",
                    "bookingCode", booking.getBookingCode(),
                    "transactionId", params.getOrDefault("vnp_TransactionNo", "")
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                    "status", "FAILED",
                    "message", "Thanh toán thất bại hoặc bị hủy",
                    "responseCode", vnpResponseCode != null ? vnpResponseCode : "99"
            ));
        }
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.processPayment(userDetails.getId(), request));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponse> getPaymentByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }
}
