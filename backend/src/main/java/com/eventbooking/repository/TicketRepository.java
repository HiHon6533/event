package com.eventbooking.repository;

import com.eventbooking.entity.Ticket;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByEventIdAndZoneId(Long eventId, Long zoneId);

    // Pessimistic Write ngăn luồng khác đọc/ghi vào row này cho đến khi Transaction kết thúc
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({@QueryHint(name = "javax.persistence.lock.timeout", value = "0")}) 
    @Query("SELECT t FROM Ticket t WHERE t.id IN :ticketIds AND t.status = 'AVAILABLE'")
    List<Ticket> findAvailableTicketsForUpdate(@Param("ticketIds") List<Long> ticketIds);

    @Query("SELECT t FROM Ticket t WHERE t.status = 'HELD' AND t.holdUntil < CURRENT_TIMESTAMP")
    List<Ticket> findExpiredHeldTickets();
}
