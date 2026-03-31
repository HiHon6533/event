package com.eventbooking.service;

import com.eventbooking.dto.response.TicketResponse;
import java.util.List;

public interface TicketService {
    List<TicketResponse> getTicketsByEventAndZone(Long eventId, Long zoneId);
    List<TicketResponse> holdTickets(List<Long> ticketIds); // Returns locked tickets or throws exception
    void releaseExpiredHolds(); // Background job
}
