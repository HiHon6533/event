package com.eventbooking.service.impl;

import com.eventbooking.dto.request.PaymentRequest;
import com.eventbooking.dto.response.PaymentResponse;
import com.eventbooking.entity.Booking;
import com.eventbooking.entity.Payment;
import com.eventbooking.entity.enums.BookingStatus;
import com.eventbooking.entity.enums.PaymentStatus;
import com.eventbooking.exception.BadRequestException;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.PaymentMapper;
import com.eventbooking.repository.BookingRepository;
import com.eventbooking.repository.PaymentRepository;
import com.eventbooking.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Dịch vụ xử lý nghiệp vụ thanh toán vé sự kiện.
 */
@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final PaymentMapper paymentMapper;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                             BookingRepository bookingRepository,
                             PaymentMapper paymentMapper) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.paymentMapper = paymentMapper;
    }

    /**
     * Xử lý thanh toán. Kiểm tra quyền, trạng thái đơn hàng và mô phỏng giao dịch thành công.
     */
    @Override
    @Transactional
    public PaymentResponse processPayment(Long userId, PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền thanh toán đơn này");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Đơn đặt vé không ở trạng thái chờ thanh toán");
        }

        // Simulate payment processing
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .paymentMethod(request.getMethod())
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .status(PaymentStatus.SUCCESS)
                .paymentDate(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);

        // Update booking status
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPayment(payment);
        bookingRepository.save(booking);

        return paymentMapper.toResponse(payment);
    }

    /**
     * Lấy chi tiết thông tin giao dịch dựa trên ID của đơn đặt vé.
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "bookingId", bookingId));
        return paymentMapper.toResponse(payment);
    }
}
