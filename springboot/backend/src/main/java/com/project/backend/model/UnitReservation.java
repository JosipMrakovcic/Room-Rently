package com.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unitReservation")
public class UnitReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUnitReservation;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(columnDefinition = "text", nullable = false)
    private String status;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    private Person person;

    @ManyToOne
    @JoinColumn(name = "idUnit", nullable = false)
    private Unit unit;

}
