package com.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unit")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUnit;

    @Column(nullable = false)
    private Integer price;

    @Column
    private Integer numRooms;

    @Column(nullable = false)
    private Integer capAdults;

    @Column(nullable = false)
    private Integer capChildren;

    @Column(nullable = false)
    private Integer numBeds;

    @Column(nullable = true)
    private Integer rating;

    @Column(nullable = false)
    private boolean hasParking;

    @Column(nullable = false)
    private boolean hasWifi;

    @Column(nullable = false)
    private boolean hasBreakfast;

    @Column(nullable = false)
    private boolean hasTowels;

    @Column(nullable = false)
    private boolean hasShampoo;

    @Column(nullable = false)
    private boolean hasHairDryer;

    @Column(nullable = false)
    private boolean hasHeater;

    @Column(nullable = false)
    private boolean hasAirConditioning;

    @Column(name = "is_apartment", nullable = false)
    @JsonProperty("isApartment")
    private boolean apartment;


    @Column(columnDefinition = "text", nullable = false)
    private String unitName;

    @Column(columnDefinition = "text", nullable = true)
    private String location;

    @Column(columnDefinition = "text", nullable = false)
    private String mainDescName;

    @Column(columnDefinition = "text", nullable = false)
    private String mainDescContent;

    @Column(columnDefinition = "text", nullable = false)
    private String secDescName;

    @Column(columnDefinition = "text", nullable = false)
    private String secDescContent;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnitImg> images;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnitReservation> unitReservations;

}
