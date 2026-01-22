package springboot.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unit")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unit")
    private Long idUnit;

    @Column(nullable = false)
    private Integer price;

    @Column
    private Integer numRooms;

    @Column
    private Integer numSameRooms;

    @ManyToOne
    @JoinColumn(name = "parent_unit_id")
    @JsonIgnoreProperties("listOfRooms")
    private Unit parentUnit;

    @OneToMany(mappedBy = "parentUnit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Ovo sprječava da glavni unit povlači sve svoje sobe u JSON-u pri pretrazi
    @OrderBy("unitName ASC")
    private List<Unit> listOfRooms = new ArrayList<>();


    @Column(nullable = false)
    private Integer capAdults;

    @Column(nullable = false)
    private Integer capChildren;

    @Column(nullable = false)
    private Integer numBeds;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @JsonProperty("rating")
    public Double getRating() {
        if (averageRating == null || averageRating == 0.0) return null;
        return Math.round(averageRating * 10.0) / 10.0;
    }

    @Column(nullable = false)
    private boolean seaView;

    @Column(nullable = false)
    private boolean lakeView;

    @Column(nullable = false)
    private boolean villageView;

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

    @JsonManagedReference
    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnitImg> images = new ArrayList<>();

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UnitReservation> unitReservations = new ArrayList<>();

    public void addRoom(Unit room) {
        this.listOfRooms.add(room);
        room.setParentUnit(this);
    }
}