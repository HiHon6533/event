package com.eventbooking.service;

import com.eventbooking.dto.request.TicketCategoryRequest;
import com.eventbooking.dto.response.TicketCategoryResponse;

import java.util.List;

public interface TicketCategoryService {
    List<TicketCategoryResponse> getByEventId(Long eventId);
    TicketCategoryResponse createTicketCategory(TicketCategoryRequest request);
    TicketCategoryResponse updateTicketCategory(Long id, TicketCategoryRequest request);
    void deleteTicketCategory(Long id);
}
