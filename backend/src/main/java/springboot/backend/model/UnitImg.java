package springboot.backend.model;

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
    @Column(columnDefinition = "text", nullable = false)
    private String URL;

    @ManyToOne
    @JoinColumn(name = "idUnit", nullable = false)
    private Unit unit;


    public String getURL() {
        return URL;
    }

    public void setURL(String URL) {
        this.URL = URL;
    }
}
