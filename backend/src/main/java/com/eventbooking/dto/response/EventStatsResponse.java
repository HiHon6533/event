package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class EventStatsResponse {
    private Long eventId;
    private String eventTitle;

    // Ticket Sales
    private long totalTicketsSold;
    private long totalTicketsAvailable;
    private BigDecimal totalRevenue;

    // Attendance
    private long totalCheckedIn;
    private double attendanceRate; // checkedIn / confirmed bookings %

    // Breakdown per ticket category
    private List<TicketSalesBreakdown> ticketBreakdown;

    // Attendees (confirmed bookings)
    private List<AttendeeInfo> attendees;

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TicketSalesBreakdown {
        private Long ticketCategoryId;
        private String ticketName;
        private String zoneName;
        private BigDecimal price;
        private int totalQuantity;
        private int soldQuantity;
        private int remainingQuantity;
        private BigDecimal revenue;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AttendeeInfo {
        private Long bookingId;
        private String bookingCode;
        private String fullName;
        private String email;
        private int ticketCount;
        private BigDecimal totalAmount;
        private String status;
        private Boolean isCheckedIn;
        private String ticketDetails;
    }
}
