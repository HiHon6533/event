package com.eventbooking.repository;

import com.eventbooking.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByVenueIdAndIsActiveTrueOrderBySortOrder(Long venueId);
    List<Zone> findByVenueId(Long venueId);
}
