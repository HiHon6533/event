package com.eventbooking.controller;

import com.eventbooking.entity.Event;
import com.eventbooking.entity.User;
import com.eventbooking.entity.Venue;
import com.eventbooking.exception.ResourceNotFoundException;
import com.eventbooking.repository.EventRepository;
import com.eventbooking.repository.UserRepository;
import com.eventbooking.repository.VenueRepository;
import com.eventbooking.security.CustomUserDetails;
import com.eventbooking.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST endpoints for uploading images.
 * Use form-data with key "file" to upload.
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class ImageUploadController {

    private final FileStorageService fileStorageService;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    // ── Event Image Uploads ─────────────────────────────────────

    /** Upload banner image for an event */
    @PostMapping("/events/{id}/banner")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> uploadEventBanner(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        String url = fileStorageService.store(file, "events");
        event.setBannerUrl(url);
        eventRepository.save(event);

        return ResponseEntity.ok(Map.of("message", "Banner uploaded successfully", "url", url));
    }

    /** Upload thumbnail image for an event */
    @PostMapping("/events/{id}/thumbnail")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> uploadEventThumbnail(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        String url = fileStorageService.store(file, "events");
        event.setThumbnailUrl(url);
        eventRepository.save(event);

        return ResponseEntity.ok(Map.of("message", "Thumbnail uploaded successfully", "url", url));
    }

    /** Upload map image for an event */
    @PostMapping("/events/{id}/map")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> uploadEventMap(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        String url = fileStorageService.store(file, "events");
        event.setMapUrl(url);
        eventRepository.save(event);

        return ResponseEntity.ok(Map.of("message", "Map uploaded successfully", "url", url));
    }

    /** Upload main image for an event */
    @PostMapping("/events/{id}/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> uploadEventImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        String url = fileStorageService.store(file, "events");
        event.setImageUrl(url);
        eventRepository.save(event);

        return ResponseEntity.ok(Map.of("message", "Image uploaded successfully", "url", url));
    }

    /** Upload organizer logo for an event */
    @PostMapping("/events/{id}/organizer-logo")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> uploadEventOrganizerLogo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));

        String url = fileStorageService.store(file, "events");
        event.setOrganizerLogoUrl(url);
        eventRepository.save(event);

        return ResponseEntity.ok(Map.of("message", "Organizer logo uploaded successfully", "url", url));
    }

    // ── Venue Image Uploads ─────────────────────────────────────

    /** Upload main image for a venue */
    @PostMapping("/venues/{id}/image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadVenueImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));

        String url = fileStorageService.store(file, "venues");
        venue.setImageUrl(url);
        venueRepository.save(venue);

        return ResponseEntity.ok(Map.of("message", "Venue image uploaded successfully", "url", url));
    }

    /** Upload seat map image for a venue */
    @PostMapping("/venues/{id}/seat-map")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadVenueSeatMap(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", "id", id));

        String url = fileStorageService.store(file, "venues");
        venue.setSeatMapImage(url);
        venueRepository.save(venue);

        return ResponseEntity.ok(Map.of("message", "Seat map uploaded successfully", "url", url));
    }

    // ── User Avatar Upload ──────────────────────────────────────

    /** Upload avatar for the currently authenticated user */
    @PostMapping("/users/avatar")
    public ResponseEntity<Map<String, String>> uploadUserAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file) {

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userDetails.getId()));

        String url = fileStorageService.store(file, "avatars");
        user.setAvatarUrl(url);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Avatar uploaded successfully", "url", url));
    }
}
