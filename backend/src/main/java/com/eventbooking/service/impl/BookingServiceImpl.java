package com.eventbooking.service.impl;

import com.eventbooking.dto.request.BookingDetailRequest;
import com.eventbooking.dto.request.BookingRequest;
import com.eventbooking.dto.response.BookingResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.entity.*;
import com.eventbooking.entity.enums.BookingStatus;
import com.eventbooking.exception.BadRequestException;
import com.eventbooking.exception.InsufficientTicketException;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.BookingMapper;
import com.eventbooking.repository.*;
import com.eventbooking.service.BookingService;
import com.eventbooking.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TicketCategoryRepository ticketCategoryRepository;
    private final BookingMapper bookingMapper;
    private final SecurityUtils securityUtils;

    public BookingServiceImpl(BookingRepository bookingRepository,
                             BookingDetailRepository bookingDetailRepository,
                             EventRepository eventRepository,
                             UserRepository userRepository,
                             TicketCategoryRepository ticketCategoryRepository,
                             BookingMapper bookingMapper,
                             SecurityUtils securityUtils) {
        this.bookingRepository = bookingRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.ticketCategoryRepository = ticketCategoryRepository;
        this.bookingMapper = bookingMapper;
        this.securityUtils = securityUtils;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));

        // Generate unique booking code
        String bookingCode = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .bookingCode(bookingCode)
                .bookingDate(LocalDateTime.now())
                .status(BookingStatus.PENDING)
                .note(request.getNote())
                .qrSecretToken(null) // Assigned later when paid
                .isCheckedIn(false)
                .build();

        int totalTickets = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<BookingDetail> details = new ArrayList<>();

        for (BookingDetailRequest itemReq : request.getItems()) {
            TicketCategory tc = ticketCategoryRepository.findById(itemReq.getTicketCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("TicketCategory", "id", itemReq.getTicketCategoryId()));

            // Check availability
            if (tc.getRemainingQuantity() < itemReq.getQuantity()) {
                throw new InsufficientTicketException(
                        "Không đủ vé '" + tc.getName() + "'. Còn lại: " + tc.getRemainingQuantity());
            }

            // Check max per booking
            if (tc.getMaxPerBooking() != null && itemReq.getQuantity() > tc.getMaxPerBooking()) {
                throw new BadRequestException(
                        "Số lượng vé '" + tc.getName() + "' vượt quá giới hạn (" + tc.getMaxPerBooking() + " vé/đơn)");
            }

            BigDecimal subtotal = tc.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            BookingDetail detail = BookingDetail.builder()
                    .booking(booking)
                    .ticketCategory(tc)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(tc.getPrice())
                    .subtotal(subtotal)
                    .build();

            details.add(detail);
            totalTickets += itemReq.getQuantity();
            totalAmount = totalAmount.add(subtotal);

            // Decrease available quantity
            tc.setSoldQuantity(tc.getSoldQuantity() + itemReq.getQuantity());
            tc.setRemainingQuantity(tc.getRemainingQuantity() - itemReq.getQuantity());
            ticketCategoryRepository.save(tc);
        }

        booking.setTotalTickets(totalTickets);
        booking.setTotalAmount(totalAmount);
        booking = bookingRepository.save(booking);

        for (BookingDetail detail : details) {
            detail.setBooking(booking);
        }
        bookingDetailRepository.saveAll(details);
        booking.setBookingDetails(details);

        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        // Users can only see their own bookings (admin check done at controller level)
        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xem đơn đặt vé này");
        }
        return bookingMapper.toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(Long userId, int page, int size) {
        Page<Booking> bookings = bookingRepository.findByUserId(userId,
                PageRequest.of(page, size, Sort.by("bookingDate").descending()));
        return PageResponse.<BookingResponse>builder()
                .content(bookings.getContent().stream().map(bookingMapper::toResponse).collect(Collectors.toList()))
                .page(bookings.getNumber())
                .size(bookings.getSize())
                .totalElements(bookings.getTotalElements())
                .totalPages(bookings.getTotalPages())
                .last(bookings.isLast())
                .build();
    }

    @Override
    @Transactional
    public void cancelBooking(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền hủy đơn đặt vé này");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Đơn đặt vé đã bị hủy trước đó");
        }

        // Restore ticket quantities
        for (BookingDetail detail : booking.getBookingDetails()) {
            TicketCategory tc = detail.getTicketCategory();
            tc.setSoldQuantity(tc.getSoldQuantity() - detail.getQuantity());
            tc.setRemainingQuantity(tc.getRemainingQuantity() + detail.getQuantity());
            ticketCategoryRepository.save(tc);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getAllBookings(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookings;

        if (securityUtils.isCurrentUserManager()) {
            bookings = bookingRepository.findByEventManagerIdOrderByCreatedAtDesc(securityUtils.getCurrentUserId(), pageRequest);
        } else {
            bookings = bookingRepository.findAll(pageRequest);
        }

        return PageResponse.<BookingResponse>builder()
                .content(bookings.getContent().stream().map(bookingMapper::toResponse).collect(Collectors.toList()))
                .page(bookings.getNumber())
                .size(bookings.getSize())
                .totalElements(bookings.getTotalElements())
                .totalPages(bookings.getTotalPages())
                .last(bookings.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public String getBookingQrCode(Long id, Long userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xem mã QR này");
        }
        return booking.getQrSecretToken();
    }
}
