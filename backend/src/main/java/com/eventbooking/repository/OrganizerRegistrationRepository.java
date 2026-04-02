package com.eventbooking.repository;

import com.eventbooking.entity.OrganizerRegistration;
import com.eventbooking.entity.enums.OrganizerRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizerRegistrationRepository extends JpaRepository<OrganizerRegistration, Long> {

    Page<OrganizerRegistration> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<OrganizerRegistration> findByStatusOrderByCreatedAtDesc(OrganizerRequestStatus status, Pageable pageable);

    Optional<OrganizerRegistration> findByUserIdAndStatus(Long userId, OrganizerRequestStatus status);

    boolean existsByUserIdAndStatus(Long userId, OrganizerRequestStatus status);

    long countByStatus(OrganizerRequestStatus status);
}
