package springboot.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ReservationRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long personId; // Povezuje se na id u Person modelu
    private Long unitId;   // Povezuje se na idUnit u Unit modelu
    private int adults;
    private int children;
    private List<String> amenities; // React šalje ["wifi", "parking"]

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
}