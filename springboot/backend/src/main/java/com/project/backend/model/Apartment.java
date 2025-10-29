package com.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "apartment")
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idApartment;

    @Column(nullable = false)
    private int price;

    @Column(nullable = false)
    private int numRooms;

    @Column(nullable = false)
    private int capAdults;

    @Column(nullable = false)
    private int capChildren;

    @Column(nullable = false)
    private int numBeds;

    @Column(nullable = false)
    private int rating;

    @Column(nullable = false)
    private boolean hasParking;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApartmentImg> images;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApartmentReservation> reservations;
}
