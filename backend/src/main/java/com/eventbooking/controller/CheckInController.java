package com.eventbooking.controller;

import com.eventbooking.entity.Booking;
import com.eventbooking.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller mô phỏng tính năng quét mã QR check-in tại cổng sự kiện thực tế.
 */
@RestController
@RequestMapping("/api/checkin")
public class CheckInController {

    private final BookingRepository bookingRepository;

    public CheckInController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @PostMapping("/{token}")
    public ResponseEntity<?> simulateCheckIn(@PathVariable String token) {
        Booking booking = bookingRepository.findByQrSecretToken(token).orElse(null);

        if (booking == null) {
            System.err.println("⚠ Lỗi: Token không hợp lệ. Không tìm thấy vé!");
            return ResponseEntity.badRequest().body(Map.of("message", "Token không hợp lệ hoặc không tồn tại"));
        }

        if (Boolean.TRUE.equals(booking.getIsCheckedIn())) {
            System.err.println("⚠ Trạng thái: Người dùng " + booking.getUser().getFullName() + " (Đơn #" + booking.getBookingCode() + ") ĐÃ check-in trước đó rồi.");
            return ResponseEntity.badRequest().body(Map.of("message", "Vé này đã được check-in trước đó"));
        }

        booking.setIsCheckedIn(true);
        bookingRepository.save(booking);

        System.out.println("✅ THÀNH CÔNG: Người dùng " + booking.getUser().getFullName() + " (Đơn #" + booking.getBookingCode() + ") đã check-in thành công tại sự kiện: " + booking.getEvent().getTitle());

        return ResponseEntity.ok(Map.of(
                "message", "Check-in thành công",
                "bookingCode", booking.getBookingCode(),
                "user", booking.getUser().getFullName(),
                "event", booking.getEvent().getTitle()
        ));
    }
}
