package springboot.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unitReservation")
@Getter // automatski generira sve gettere
@Setter // automatski generira sve settere
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
