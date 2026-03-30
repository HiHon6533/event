package com.eventbooking.service;

import com.eventbooking.dto.request.EventRequest;
import com.eventbooking.dto.response.EventDetailResponse;
import com.eventbooking.dto.response.EventResponse;
import com.eventbooking.dto.response.PageResponse;
import com.eventbooking.entity.enums.EventCategory;
import com.eventbooking.entity.enums.EventStatus;

import java.util.List;

public interface EventService {
    PageResponse<EventResponse> getPublishedEvents(EventCategory category, String keyword, int page, int size);
    List<EventResponse> getFeaturedEvents();
    EventDetailResponse getEventById(Long id);
    EventResponse createEvent(EventRequest request);
    EventResponse updateEvent(Long id, EventRequest request);
    void updateEventStatus(Long id, EventStatus status);
    void deleteEvent(Long id);
    PageResponse<EventResponse> getAllEvents(int page, int size);
}
