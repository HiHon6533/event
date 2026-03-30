package com.eventbooking.service;

import com.eventbooking.dto.request.ZoneRequest;
import com.eventbooking.dto.response.ZoneResponse;

import java.util.List;

public interface ZoneService {
    List<ZoneResponse> getZonesByVenueId(Long venueId);
    ZoneResponse createZone(ZoneRequest request);
    ZoneResponse updateZone(Long id, ZoneRequest request);
    void deleteZone(Long id);
}
