package com.eventbooking.repository;

import com.eventbooking.entity.Booking;
import com.eventbooking.entity.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserId(Long userId, Pageable pageable);

    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findByEventId(Long eventId, Pageable pageable);

    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b " +
           "WHERE b.status = 'CONFIRMED' AND b.bookingTime BETWEEN :start AND :end")
    BigDecimal getRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") BookingStatus status);

    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.event.manager.id = :managerId ORDER BY b.createdAt DESC")
    Page<Booking> findByEventManagerIdOrderByCreatedAtDesc(@Param("managerId") Long managerId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = 'CONFIRMED' AND b.event.manager.id = :managerId")
    BigDecimal getTotalRevenueByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b " +
           "WHERE b.status = 'CONFIRMED' AND b.bookingTime BETWEEN :start AND :end AND b.event.manager.id = :managerId")
    BigDecimal getRevenueBetweenAndManagerId(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("managerId") Long managerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.manager.id = :managerId")
    long countByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.event.manager.id = :managerId")
    long countByStatusAndManagerId(@Param("status") BookingStatus status, @Param("managerId") Long managerId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.bookingTime >= :startDate")
    List<Booking> findConfirmedBookingsSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.bookingTime >= :startDate AND b.event.manager.id = :managerId")
    List<Booking> findConfirmedBookingsSinceByManagerId(@Param("startDate") LocalDateTime startDate, @Param("managerId") Long managerId);
}
