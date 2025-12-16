package springboot.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "unit_reservation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id") // <--- PRISILNO MAPIRANJE: Ovo rješava "null value in column id"
    private Long idUnitReservation;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String status = "Pending";

    @Column
    private int adults;

    @Column
    private int children;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_person", referencedColumnName = "id", nullable = false)
    private Person person;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_unit", referencedColumnName = "id_unit", nullable = false)
    private Unit unit;

    @Column(columnDefinition = "text") // Koristimo text da možemo spremiti duži popis
    private String selectedAmenities;
}