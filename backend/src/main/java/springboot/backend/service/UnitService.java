package springboot.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import springboot.backend.model.Unit;
import springboot.backend.repository.UnitRepo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class UnitService {

    @Autowired
    private UnitRepo unitRepo;

    public List<Unit> filterUnits(
            String name,
            Integer adults,
            Integer children,
            Integer rooms,
            Boolean isApartment,
            Boolean hasParking,
            Boolean hasWifi,
            Boolean hasBreakfast,
            Boolean hasTowels,
            Boolean hasShampoo,
            Boolean hasHairDryer,
            Boolean hasHeater,
            Boolean hasAirConditioning,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            LocalDate startDate, // <-- DODANO
            LocalDate endDate    // <-- DODANO
    ) {

        String searchName = StringUtils.hasText(name) ? name : null;

        // Proslijeđuješ sve parametre, uključujući nove datume, u UnitRepo
        return unitRepo.filterUnits(
                searchName,
                adults,
                children,
                rooms,
                isApartment,
                hasParking,
                hasWifi,
                hasBreakfast,
                hasTowels,
                hasShampoo,
                hasHairDryer,
                hasHeater,
                hasAirConditioning,
                minPrice,
                maxPrice,
                startDate, // <-- PROSLIJEĐENO
                endDate    // <-- PROSLIJEĐENO
        );
    }
}