package springboot.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import springboot.backend.dto.UnitFilterDTO;
import springboot.backend.repository.UnitRepo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class UnitService {

    @Autowired
    private UnitRepo unitRepo;

    public List<UnitFilterDTO> filterUnitsDTO(
            String name, Integer adults, Integer children, Integer rooms,
            Integer beds,
            Boolean isApartment, Boolean seaView, Boolean lakeView,
            Boolean villageView, Boolean hasParking, Boolean hasWifi,
            Boolean hasBreakfast, Boolean hasTowels, Boolean hasShampoo,
            Boolean hasHairDryer, Boolean hasHeater, Boolean hasAirConditioning,
            BigDecimal minPrice, BigDecimal maxPrice,
            LocalDate startDate, LocalDate endDate
    ) {

        String searchName = StringUtils.hasText(name) ? name : null;

        // Pozivamo upit iz repositoryja
        return unitRepo.filterUnitsDTO(
                searchName, adults, children, rooms, beds,
                isApartment, seaView, lakeView, villageView, hasParking, hasWifi, hasBreakfast,
                hasTowels, hasShampoo, hasHairDryer, hasHeater,
                hasAirConditioning, minPrice, maxPrice, startDate, endDate
        );
    }
}