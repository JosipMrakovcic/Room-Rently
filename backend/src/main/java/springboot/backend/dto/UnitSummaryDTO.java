package springboot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor // Dobra praksa je imati i prazan konstruktor za serijalizaciju
public class UnitSummaryDTO {
    private Long idUnit;
    private String unitName;
    private boolean apartment; // Promijenjeno iz isApartment u apartment
    private Integer numSameRooms;
}