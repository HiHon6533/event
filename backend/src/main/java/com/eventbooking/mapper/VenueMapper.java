package com.eventbooking.mapper;

import com.eventbooking.dto.request.VenueRequest;
import com.eventbooking.dto.response.VenueResponse;
import com.eventbooking.entity.Venue;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class VenueMapper {

    private final ZoneMapper zoneMapper;

    public VenueMapper(ZoneMapper zoneMapper) {
        this.zoneMapper = zoneMapper;
    }

    public VenueResponse toResponse(Venue venue) {
        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .address(venue.getAddress())
                .city(venue.getCity())
                .phone(venue.getPhone())
                .totalCapacity(venue.getTotalCapacity())
                .imageUrl(venue.getImageUrl())
                .seatMapImage(venue.getSeatMapImage())
                .description(venue.getDescription())
                .isActive(venue.getIsActive())
                .zones(venue.getZones() != null
                        ? venue.getZones().stream().map(zoneMapper::toResponse).collect(Collectors.toList())
                        : Collections.emptyList())
                .createdAt(venue.getCreatedAt())
                .build();
    }

    public VenueResponse toResponseWithoutZones(Venue venue) {
        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .address(venue.getAddress())
                .city(venue.getCity())
                .phone(venue.getPhone())
                .totalCapacity(venue.getTotalCapacity())
                .imageUrl(venue.getImageUrl())
                .seatMapImage(venue.getSeatMapImage())
                .description(venue.getDescription())
                .isActive(venue.getIsActive())
                .createdAt(venue.getCreatedAt())
                .build();
    }

    public Venue toEntity(VenueRequest request) {
        return Venue.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .phone(request.getPhone())
                .totalCapacity(request.getTotalCapacity())
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .build();
    }

    public void updateEntity(Venue venue, VenueRequest request) {
        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setCity(request.getCity());
        venue.setPhone(request.getPhone());
        venue.setTotalCapacity(request.getTotalCapacity());
        venue.setImageUrl(request.getImageUrl());
        venue.setDescription(request.getDescription());
    }
}
