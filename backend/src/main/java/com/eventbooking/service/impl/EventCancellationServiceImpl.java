package com.eventbooking.service.impl;

import com.eventbooking.dto.request.CreateEventCancellationRequest;
import com.eventbooking.dto.response.EventCancellationResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.entity.Booking;
import com.eventbooking.entity.Event;
import com.eventbooking.entity.EventCancellationRequest;
import com.eventbooking.entity.Payment;
import com.eventbooking.entity.enums.BookingStatus;
import com.eventbooking.entity.enums.EventCancelStatus;
import com.eventbooking.entity.enums.EventStatus;
import com.eventbooking.entity.enums.PaymentStatus;
import com.eventbooking.exception.BadRequestException;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.repository.BookingRepository;
import com.eventbooking.repository.EventCancellationRequestRepository;
import com.eventbooking.repository.EventRepository;
import com.eventbooking.repository.PaymentRepository;
import com.eventbooking.service.EmailService;
import com.eventbooking.service.EventCancellationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventCancellationServiceImpl implements EventCancellationService {

    private final EventCancellationRequestRepository cancelReqRepo;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    private EventCancellationResponse mapToDto(EventCancellationRequest req) {
        return EventCancellationResponse.builder()
                .id(req.getId())
                .eventId(req.getEvent().getId())
                .eventTitle(req.getEvent().getTitle())
                .reason(req.getReason())
                .totalTicketsSold(req.getTotalTicketsSold())
                .totalRefundAmount(req.getTotalRefundAmount())
                .status(req.getStatus().name())
                .adminNote(req.getAdminNote())
                .requestedAt(req.getRequestedAt())
                .processedAt(req.getProcessedAt())
                .build();
    }

    @Override
    public Map<String, Object> getCancellationStats(Long eventId) {
        List<Booking> confirmedBookings = bookingRepository.findByEventIdAndStatusIn(eventId, List.of(BookingStatus.CONFIRMED));
        long tickets = 0;
        BigDecimal amount = BigDecimal.ZERO;
        for (Booking b : confirmedBookings) {
            tickets += b.getTotalTickets();
            amount = amount.add(b.getTotalAmount());
        }
        Map<String, Object> map = new HashMap<>();
        map.put("totalTicketsSold", tickets);
        map.put("totalRefundAmount", amount);
        return map;
    }

    @Override
    @Transactional
    public EventCancellationResponse requestCancellation(Long managerId, CreateEventCancellationRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!event.getManager().getId().equals(managerId)) {
            throw new BadRequestException("Not your event");
        }

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new BadRequestException("Event is already cancelled");
        }
        
        cancelReqRepo.findByEventIdAndStatus(event.getId(), EventCancelStatus.PENDING)
                .ifPresent(r -> { throw new BadRequestException("A cancellation request is already pending"); });

        Map<String, Object> stats = getCancellationStats(event.getId());

        EventCancellationRequest req = EventCancellationRequest.builder()
                .event(event)
                .reason(request.getReason())
                .totalTicketsSold((Long) stats.get("totalTicketsSold"))
                .totalRefundAmount((BigDecimal) stats.get("totalRefundAmount"))
                .status(EventCancelStatus.PENDING)
                .build();

        cancelReqRepo.save(req);
        return mapToDto(req);
    }

    @Override
    @Transactional
    public EventCancellationResponse reviewRequest(Long requestId, boolean approved, String adminNote) {
        EventCancellationRequest req = cancelReqRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (req.getStatus() != EventCancelStatus.PENDING) {
            throw new BadRequestException("Request is not PENDING");
        }

        req.setStatus(approved ? EventCancelStatus.APPROVED : EventCancelStatus.REJECTED);
        req.setAdminNote(adminNote);
        req.setProcessedAt(LocalDateTime.now());
        
        cancelReqRepo.save(req);
        return mapToDto(req);
    }

    @Override
    @Transactional
    public EventCancellationResponse executeRefund(Long managerId, Long requestId) {
        EventCancellationRequest req = cancelReqRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        Event event = req.getEvent();
        if (!event.getManager().getId().equals(managerId)) {
            throw new BadRequestException("Not your event");
        }

        if (req.getStatus() != EventCancelStatus.APPROVED) {
            throw new BadRequestException("Request is not APPROVED, cannot execute refund");
        }

        // 1. Mark Event Cancelled
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);

        // 2. Fetch all confirmed bookings
        List<Booking> bookings = bookingRepository.findByEventIdAndStatusIn(event.getId(), List.of(BookingStatus.CONFIRMED));

        for (Booking b : bookings) {
            // Cancel booking
            b.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(b);

            // Refund payment
            paymentRepository.findByBookingId(b.getId()).ifPresent(p -> {
                p.setStatus(PaymentStatus.REFUNDED);
                p.setNote("Hoàn tiền tự động do hủy sự kiện: " + req.getReason());
                paymentRepository.save(p);
            });

            // Send Email
            String userEmail = b.getUser().getEmail();
            String subject = "THÔNG BÁO HỦY SỰ KIỆN & HOÀN TIỀN: " + event.getTitle();
            String content = String.format("Chào %s,\n\n" +
                    "Chúng tôi rất tiếc phải thông báo sự kiện '%s' đã bị hủy.\n" +
                    "Lý do từ Ban tổ chức: %s\n\n" +
                    "Hệ thống sẽ tiến hành hoàn tiền cho đơn đặt vé %s (Số tiền: %s VNĐ). " +
                    "Vui lòng cung cấp số tài khoản ngân hàng của bạn bằng cách phản hồi lại email này để chúng tôi hoàn thiện thủ tục.\n\n" +
                    "Một lần nữa, chúng tôi xin gửi lời xin lỗi sâu sắc tới bạn!\n" +
                    "BQT Nền tảng.",
                    b.getUser().getFullName(), event.getTitle(), req.getReason(), b.getBookingCode(), b.getTotalAmount());
            
            // Assuming emailService has a generic sendEmail or we use sendPaymentResult
            try {
                // If there's a simple sendMail method, use it, else adapt.
                emailService.sendRefundEmail(userEmail, subject, content); // Will add this to EmailService
            } catch(Exception e) {
                System.err.println("Failed to send refund email to " + userEmail);
            }
        }

        req.setStatus(EventCancelStatus.REFUND_COMPLETED);
        req.setProcessedAt(LocalDateTime.now());
        cancelReqRepo.save(req);

        return mapToDto(req);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EventCancellationResponse> getRequests(int page, int size, String status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("requestedAt").descending());
        Page<EventCancellationRequest> pages;
        if (status != null && !status.isEmpty()) {
            pages = cancelReqRepo.findByStatus(EventCancelStatus.valueOf(status), pageRequest);
        } else {
            pages = cancelReqRepo.findAll(pageRequest);
        }

        List<EventCancellationResponse> list = pages.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PageResponse.<EventCancellationResponse>builder()
                .content(list)
                .page(pages.getNumber())
                .size(pages.getSize())
                .totalElements(pages.getTotalElements())
                .totalPages(pages.getTotalPages())
                .last(pages.isLast())
                .build();
    }
}
