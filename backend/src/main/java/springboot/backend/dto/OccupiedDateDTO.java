package springboot.backend.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OccupiedDateDTO {
    private LocalDate startDate;
    private LocalDate endDate;
}