package springboot.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unitImg")
@Getter // automatski generira sve gettere
@Setter // automatski generira sve settere
public class UnitImg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID za JPA

    @Column(name = "url", nullable = false)
    private String url; // URL slike

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    @JsonBackReference
    private Unit unit;

    /*public String getURL() {
        return URL;
    }

    public void setURL(String URL) {
        this.URL = URL;
    }*/
}
