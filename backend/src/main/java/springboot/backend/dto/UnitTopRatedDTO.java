package springboot.backend.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnitTopRatedDTO {
    private Long idUnit;
    private String unitName;
    private BigDecimal price;
    private String imageUrl;
    private Double rating; // <-- Mora postojati

}