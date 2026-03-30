package com.eventbooking.service.impl;

import com.eventbooking.dto.request.ZoneRequest;
import com.eventbooking.dto.response.ZoneResponse;
import com.eventbooking.entity.Venue;
import com.eventbooking.entity.Zone;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.ZoneMapper;
import com.eventbooking.repository.VenueRepository;
import com.eventbooking.repository.ZoneRepository;
import com.eventbooking.service.ZoneService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ZoneServiceImpl implements ZoneService {

    private final ZoneRepository zoneRepository;
    private final VenueRepository venueRepository;
    private final ZoneMapper zoneMapper;

    public ZoneServiceImpl(ZoneRepository zoneRepository, VenueRepository venueRepository, ZoneMapper zoneMapper) {
        this.zoneRepository = zoneRepository;
        this.venueRepository = venueRepository;
        this.zoneMapper = zoneMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZoneResponse> getZonesByVenueId(Long venueId) {
        return zoneRepository.findByVenueIdAndIsActiveTrueOrderBySortOrder(venueId).stream()
                .map(zoneMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ZoneResponse createZone(ZoneRequest request) {
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", request.getVenueId()));

        Zone zone = Zone.builder()
                .venue(venue)
                .name(request.getName())
                .description(request.getDescription())
                .capacity(request.getCapacity())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .isActive(true)
                .build();

        zone = zoneRepository.save(zone);
        return zoneMapper.toResponse(zone);
    }

    @Override
    @Transactional
    public ZoneResponse updateZone(Long id, ZoneRequest request) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone", "id", id));

        zone.setName(request.getName());
        zone.setDescription(request.getDescription());
        zone.setCapacity(request.getCapacity());
        if (request.getSortOrder() != null) zone.setSortOrder(request.getSortOrder());

        zone = zoneRepository.save(zone);
        return zoneMapper.toResponse(zone);
    }

    @Override
    @Transactional
    public void deleteZone(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone", "id", id));
        zone.setIsActive(false);
        zoneRepository.save(zone);
    }
}
