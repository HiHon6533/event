package com.eventbooking.repository;

import com.eventbooking.entity.EventCancellationRequest;
import com.eventbooking.entity.enums.EventCancelStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventCancellationRequestRepository extends JpaRepository<EventCancellationRequest, Long> {
    Page<EventCancellationRequest> findByStatus(EventCancelStatus status, Pageable pageable);
    Optional<EventCancellationRequest> findByEventIdAndStatus(Long eventId, EventCancelStatus status);
}
