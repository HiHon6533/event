package com.eventbooking.service;

import com.eventbooking.dto.request.CreateEventCancellationRequest;
import com.eventbooking.dto.response.EventCancellationResponse;
import com.eventbooking.dto.response.PageResponse;

import java.util.Map;

public interface EventCancellationService {

    // For Manager to see stats before submitting
    Map<String, Object> getCancellationStats(Long eventId);

    // Manager requests cancellation
    EventCancellationResponse requestCancellation(Long managerId, CreateEventCancellationRequest request);

    // Admin approves or rejects
    EventCancellationResponse reviewRequest(Long requestId, boolean approved, String adminNote);

    // Manager executes the refund
    EventCancellationResponse executeRefund(Long managerId, Long requestId);

    // Get requests
    PageResponse<EventCancellationResponse> getRequests(int page, int size, String status);
}
