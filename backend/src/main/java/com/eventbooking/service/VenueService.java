package com.eventbooking.service;

import com.eventbooking.dto.request.VenueRequest;
import com.eventbooking.dto.response.VenueResponse;

import java.util.List;

public interface VenueService {
    List<VenueResponse> getAllVenues();
    VenueResponse getVenueById(Long id);
    VenueResponse createVenue(VenueRequest request);
    VenueResponse updateVenue(Long id, VenueRequest request);
    void deleteVenue(Long id);
}
