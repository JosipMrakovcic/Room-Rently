package com.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "apartmentImgs")
public class ApartmentImg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // dodano kao primarni ključ umjesto (URL, idApartment)

    @Column(nullable = false)
    private String url;

    @ManyToOne
    @JoinColumn(name = "idApartment", nullable = false)
    private Apartment apartment;
}
