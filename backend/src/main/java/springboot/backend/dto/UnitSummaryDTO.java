package springboot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnitSummaryDTO {
    private Long idUnit;
    private String unitName;
    private boolean apartment;
    private Integer numSameRooms;
}