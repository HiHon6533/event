package com.eventbooking.controller;

import com.eventbooking.dto.request.HoldTicketRequest;
import com.eventbooking.dto.response.TicketResponse;
import com.eventbooking.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/event/{eventId}/zone/{zoneId}")
    public ResponseEntity<List<TicketResponse>> getTicketsByZone(@PathVariable Long eventId, @PathVariable Long zoneId) {
        return ResponseEntity.ok(ticketService.getTicketsByEventAndZone(eventId, zoneId));
    }

    @PostMapping("/hold")
    public ResponseEntity<List<TicketResponse>> holdTickets(@RequestBody HoldTicketRequest request) {
        return ResponseEntity.ok(ticketService.holdTickets(request.getTicketIds()));
    }
}
