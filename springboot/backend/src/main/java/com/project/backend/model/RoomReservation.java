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
    @Table(name = "roomReservation")
    public class RoomReservation {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long idRoomReservation;

        @Column(nullable = false)
        private LocalDate startDate;

        @Column(nullable = false)
        private LocalDate endDate;

        @Column(nullable = false)
        private String status;

        @ManyToOne
        @JoinColumn(name = "id", nullable = false)
        private Person person;

        @ManyToOne
        @JoinColumn(name = "idRoom", nullable = false)
        private Room room;
    }
