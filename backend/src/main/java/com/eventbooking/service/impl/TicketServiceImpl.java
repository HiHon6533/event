package com.eventbooking.service.impl;

import com.eventbooking.dto.response.TicketResponse;
import com.eventbooking.entity.Ticket;
import com.eventbooking.entity.enums.TicketStatus;
import com.eventbooking.exception.BadRequestException;
import com.eventbooking.repository.TicketRepository;
import com.eventbooking.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Dịch vụ xử lý liên quan đến Vé (Ticket), bao gồm xem danh sách và giữ vé tạm thời.
 */
@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;

    public TicketServiceImpl(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    /**
     * Lấy danh sách tất cả các vé thuộc một sự kiện và một khu vực (Zone) cụ thể.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByEventAndZone(Long eventId, Long zoneId) {
        return ticketRepository.findByEventIdAndZoneId(eventId, zoneId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Giữ vé tạm thời (Pessimistic Lock) khi người dùng đang trong quá trình đặt vé thanh toán.
     */
    @Override
    @Transactional
    public List<TicketResponse> holdTickets(List<Long> ticketIds) {
        if (ticketIds == null || ticketIds.isEmpty()) {
            throw new BadRequestException("Danh sách vé không được rỗng");
        }

        // Pessimistic Write Lock
        List<Ticket> tickets = ticketRepository.findAvailableTicketsForUpdate(ticketIds);

        if (tickets.size() != ticketIds.size()) {
            throw new BadRequestException("Một hoặc nhiều vé bạn chọn đã bị người khác giữ hoặc đã bán.");
        }

        LocalDateTime holdLimit = LocalDateTime.now().plusMinutes(10); // Hold for 10 minutes

        for (Ticket ticket : tickets) {
            ticket.setStatus(TicketStatus.HELD);
            ticket.setHoldUntil(holdLimit);
        }

        ticketRepository.saveAll(tickets);

        return tickets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    //@Scheduled(fixedRate = 60000) // Run every 1 minute
    public void releaseExpiredHolds() {
        // Logic to release tickets where holdUntil < NOW() is handled in a scheduled task.
        // Spring Data JPA query needed.
        // System.out.println("Releasing expired tickets...");
    }

    private TicketResponse mapToResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .eventId(t.getEvent() != null ? t.getEvent().getId() : null)
                .zoneId(t.getZone() != null ? t.getZone().getId() : null)
                .zoneName(t.getZone() != null ? t.getZone().getName() : null)
                .seatId(t.getSeat() != null ? t.getSeat().getId() : null)
                .rowLabel(t.getSeat() != null ? t.getSeat().getRowLabel() : null)
                .seatNumber(t.getSeat() != null ? t.getSeat().getSeatNumber() : null)
                .price(t.getPrice())
                .dealScore(t.getDealScore())
                .status(t.getStatus())
                .build();
    }
}
