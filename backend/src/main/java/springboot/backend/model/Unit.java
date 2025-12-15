package springboot.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
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
    @Column(name = "id_unit")
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

    @Column
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

    @Column(columnDefinition = "text")
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
    @JsonIgnore
    private List<UnitImg> images;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UnitReservation> unitReservations;
}
