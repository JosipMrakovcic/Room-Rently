package springboot.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "location_settings")
public class LocationSettings {

    @Id
    private Long id = 1L; // Koristimo fiksni ID jer imamo samo jednu lokaciju

    @Column(columnDefinition = "text", nullable = false)
    private String address;

    @Column(columnDefinition = "text")
    private String googleMapsUrl;
}