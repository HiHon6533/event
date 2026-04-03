package com.eventbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long pendingEvents;
    private long pendingOrganizerRequests;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private List<DailyRevenueResponse> dailyRevenues;
    private List<BookingResponse> recentBookings;
    private List<TopEventDto> topEvents;
    private List<TopOrganizerDto> topOrganizers;
}
