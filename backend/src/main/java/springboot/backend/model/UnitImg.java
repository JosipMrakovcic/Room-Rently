package springboot.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unit_img") // Promijenjeno u snake_case (standard za baze)
@Getter
@Setter
public class UnitImg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "url", nullable = false)
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unit", nullable = false) // OVDJE JE BILA GREŠKA - mora biti id_unit
    @JsonBackReference
    private Unit unit;
}
