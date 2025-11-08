package springboot.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "person")
@Getter
@Setter
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "text", nullable = false, unique = true)
    private String email;

    @JsonProperty("is_admin") // 🔹 osigurava da JSON ima "is_admin"
    @Column(nullable = false)
    private boolean isAdmin;

    @JsonProperty("is_user") // 🔹 JSON "is_user"
    @Column(nullable = false)
    private boolean isUser;

    @JsonProperty("is_owner") // 🔹 JSON "is_owner"
    @Column(nullable = false)
    private boolean isOwner;

    @Column(columnDefinition = "text", nullable = false)
    private String name;

    public Person(String email, boolean isAdmin, boolean isUser, boolean isOwner, String name) {
        this.email = email;
        this.isAdmin = isAdmin;
        this.isUser = isUser;
        this.isOwner = isOwner;
        this.name = name;
    }

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnitReservation> unitReservations;
}
