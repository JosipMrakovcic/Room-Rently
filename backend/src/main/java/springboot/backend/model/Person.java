package springboot.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "person")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // DODAJ OVO
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "text", nullable = false, unique = true)
    private String email;

    @JsonProperty("is_admin")
    @Column(nullable = false)
    private boolean isAdmin;

    @JsonProperty("is_user")
    @Column(nullable = false)
    private boolean isUser;

    @JsonProperty("is_owner")
    @Column(nullable = false)
    private boolean isOwner;

    @Column(columnDefinition = "text", nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String country;

    @Column(columnDefinition = "text")
    private String city;

    public Person(String email, boolean isAdmin, boolean isUser, boolean isOwner, String name, String country, String city) {
        this.email = email;
        this.isAdmin = isAdmin;
        this.isUser = isUser;
        this.isOwner = isOwner;
        this.name = name;
        this.country = country;
        this.city=city;
    }

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<UnitReservation> unitReservations;
}
