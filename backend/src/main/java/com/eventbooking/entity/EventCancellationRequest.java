package com.eventbooking.entity;

import com.eventbooking.entity.enums.EventCancelStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_cancellation_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EventCancellationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(name = "total_tickets_sold")
    private Long totalTicketsSold;

    @Column(name = "total_refund_amount", precision = 14, scale = 2)
    private BigDecimal totalRefundAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private EventCancelStatus status = EventCancelStatus.PENDING;

    @Column(name = "admin_note", length = 1000)
    private String adminNote;

    @CreationTimestamp
    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
