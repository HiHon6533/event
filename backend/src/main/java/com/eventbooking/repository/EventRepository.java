package com.eventbooking.repository;

import com.eventbooking.entity.Event;
import com.eventbooking.entity.enums.EventCategory;
import com.eventbooking.entity.enums.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.status = :status " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:keyword IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Event> searchEvents(@Param("status") EventStatus status,
                             @Param("category") EventCategory category,
                             @Param("keyword") String keyword,
                             Pageable pageable);
    @Query("SELECT e FROM Event e WHERE " +
           "(:category IS NULL OR e.category = :category) " +
           "AND (:keyword IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Event> searchAllEvents(@Param("category") EventCategory category,
                                @Param("keyword") String keyword,
                                Pageable pageable);

    List<Event> findByIsFeaturedTrueAndStatus(EventStatus status);

    Page<Event> findByManagerId(Long managerId, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.manager.id = :managerId")
    long countByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT e FROM Event e " +
           "LEFT JOIN Booking b ON b.event = e AND b.status = 'CONFIRMED' " +
           "WHERE e.status = :status AND e.endTime > CURRENT_TIMESTAMP " +
           "GROUP BY e " +
           "ORDER BY COUNT(b) DESC")
    Page<Event> findTopTrendingEvents(@Param("status") EventStatus status, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = :status")
    long countByStatus(@Param("status") EventStatus status);
}
