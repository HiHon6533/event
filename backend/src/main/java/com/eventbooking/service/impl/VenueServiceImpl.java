package com.eventbooking.service.impl;

import com.eventbooking.dto.request.VenueRequest;
import com.eventbooking.dto.response.VenueResponse;
import com.eventbooking.entity.Venue;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.mapper.VenueMapper;
import com.eventbooking.repository.VenueRepository;
import com.eventbooking.service.VenueService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    public VenueServiceImpl(VenueRepository venueRepository, VenueMapper venueMapper) {
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> getAllVenues() {
        return venueRepository.findByIsActiveTrue().stream()
                .map(venueMapper::toResponseWithoutZones)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse getVenueById(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        return venueMapper.toResponse(venue);
    }

    @Override
    @Transactional
    public VenueResponse createVenue(VenueRequest request) {
        Venue venue = venueMapper.toEntity(request);
        venue.setIsActive(true);
        venue = venueRepository.save(venue);
        return venueMapper.toResponseWithoutZones(venue);
    }

    @Override
    @Transactional
    public VenueResponse updateVenue(Long id, VenueRequest request) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        venueMapper.updateEntity(venue, request);
        venue = venueRepository.save(venue);
        return venueMapper.toResponse(venue);
    }

    @Override
    @Transactional
    public void deleteVenue(Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));
        venue.setIsActive(false);
        venueRepository.save(venue);
    }
}
