package com.eventbooking.service.impl;

import com.eventbooking.dto.request.TicketCategoryRequest;
import com.eventbooking.dto.response.TicketCategoryResponse;
import com.eventbooking.entity.Event;
import com.eventbooking.entity.TicketCategory;
import com.eventbooking.entity.Zone;
import com.eventbooking.entity.enums.TicketStatus;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.TicketCategoryMapper;
import com.eventbooking.repository.EventRepository;
import com.eventbooking.repository.TicketCategoryRepository;
import com.eventbooking.repository.ZoneRepository;
import com.eventbooking.service.TicketCategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Dịch vụ quản lý Danh mục vé (Ví dụ: Vé VIP, Standard), giới hạn số lượng và thiết lập giá vé cho sự kiện.
 */
@Service
public class TicketCategoryServiceImpl implements TicketCategoryService {

    private final TicketCategoryRepository ticketCategoryRepository;
    private final EventRepository eventRepository;
    private final ZoneRepository zoneRepository;
    private final TicketCategoryMapper ticketCategoryMapper;

    public TicketCategoryServiceImpl(TicketCategoryRepository ticketCategoryRepository,
                                     EventRepository eventRepository, ZoneRepository zoneRepository,
                                     TicketCategoryMapper ticketCategoryMapper) {
        this.ticketCategoryRepository = ticketCategoryRepository;
        this.eventRepository = eventRepository;
        this.zoneRepository = zoneRepository;
        this.ticketCategoryMapper = ticketCategoryMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketCategoryResponse> getByEventId(Long eventId) {
        return ticketCategoryRepository.findByEventId(eventId).stream()
                .map(ticketCategoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketCategoryResponse createTicketCategory(TicketCategoryRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", request.getEventId()));
        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone", "id", request.getZoneId()));

        TicketCategory tc = TicketCategory.builder()
                .event(event)
                .zone(zone)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .totalQuantity(request.getTotalQuantity())
                .soldQuantity(0)
                .remainingQuantity(request.getTotalQuantity())
                .maxPerBooking(request.getMaxPerBooking() != null ? request.getMaxPerBooking() : 10)
                .status(TicketStatus.AVAILABLE)
                .build();

        tc = ticketCategoryRepository.save(tc);
        return ticketCategoryMapper.toResponse(tc);
    }

    @Override
    @Transactional
    public TicketCategoryResponse updateTicketCategory(Long id, TicketCategoryRequest request) {
        TicketCategory tc = ticketCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketCategory", "id", id));

        tc.setName(request.getName());
        tc.setDescription(request.getDescription());
        tc.setPrice(request.getPrice());

        int diff = request.getTotalQuantity() - tc.getTotalQuantity();
        tc.setTotalQuantity(request.getTotalQuantity());
        tc.setRemainingQuantity(tc.getRemainingQuantity() + diff);

        if (request.getMaxPerBooking() != null) tc.setMaxPerBooking(request.getMaxPerBooking());

        tc = ticketCategoryRepository.save(tc);
        return ticketCategoryMapper.toResponse(tc);
    }

    @Override
    @Transactional
    public void deleteTicketCategory(Long id) {
        TicketCategory tc = ticketCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketCategory", "id", id));
        tc.setStatus(TicketStatus.CLOSED);
        ticketCategoryRepository.save(tc);
    }
}
