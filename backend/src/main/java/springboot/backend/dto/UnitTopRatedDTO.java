package springboot.backend.dto;

import java.util.List;

public record UnitTopRatedDTO(
        Long idUnit,
        String unitName,
        Integer price,
        String imageUrl // Šaljemo samo jednu sliku, ne cijelu listu
) {}