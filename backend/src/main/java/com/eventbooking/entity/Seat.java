package com.eventbooking.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(name = "row_label", length = 10)
    private String rowLabel;

    @Column(name = "seat_number", length = 10)
    private String seatNumber;

    @Column(name = "quality_weight", precision = 3, scale = 2)
    @Builder.Default
    private java.math.BigDecimal qualityWeight = new java.math.BigDecimal("1.00");
}
