package com.eventbooking.controller;

import com.eventbooking.dto.request.ZoneRequest;
import com.eventbooking.dto.response.ZoneResponse;
import com.eventbooking.service.ZoneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<ZoneResponse>> getZonesByVenueId(@PathVariable Long venueId) {
        return ResponseEntity.ok(zoneService.getZonesByVenueId(venueId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ZoneResponse> createZone(@Valid @RequestBody ZoneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(zoneService.createZone(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ZoneResponse> updateZone(@PathVariable Long id,
                                                    @Valid @RequestBody ZoneRequest request) {
        return ResponseEntity.ok(zoneService.updateZone(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteZone(@PathVariable Long id) {
        zoneService.deleteZone(id);
        return ResponseEntity.noContent().build();
    }
}
