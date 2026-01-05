package springboot.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import springboot.backend.model.Unit;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnitService {

    @Autowired
    private UnitRepo unitRepo;

    @Autowired
    private UnitReservationRepo reservationRepo;

    public List<Unit> filterUnits(
            String name, Integer adults, Integer children, Integer rooms,
            Integer beds, // <--- Dodano u potpis metode
            Boolean isApartment, Boolean seaView, Boolean lakeView,
            Boolean villageView,Boolean hasParking, Boolean hasWifi,
            Boolean hasBreakfast, Boolean hasTowels, Boolean hasShampoo,
            Boolean hasHairDryer, Boolean hasHeater, Boolean hasAirConditioning,
            BigDecimal minPrice, BigDecimal maxPrice,
            LocalDate startDate, LocalDate endDate
    ) {

        String searchName = StringUtils.hasText(name) ? name : null;

        // Dohvaćamo jedinice
        List<Unit> basicFilteredUnits = unitRepo.filterUnits(
                searchName, adults, children, rooms, beds,
                isApartment, seaView, lakeView, villageView,hasParking, hasWifi, hasBreakfast,
                hasTowels, hasShampoo, hasHairDryer, hasHeater,
                hasAirConditioning, minPrice, maxPrice, startDate, endDate
        );

        if (startDate == null || endDate == null) {
            return basicFilteredUnits;
        }

        return basicFilteredUnits.stream()
                .filter(unit -> isUnitAvailable(unit, startDate, endDate))
                .collect(Collectors.toList());
    }

    private boolean isUnitAvailable(Unit unit, LocalDate start, LocalDate end) {
        if (unit.getListOfRooms() != null && !unit.getListOfRooms().isEmpty()) {
            return unit.getListOfRooms().stream().anyMatch(child ->
                    !reservationRepo.existsByUnitAndDatesOverlap(child, start, end)
            );
        }
        return !reservationRepo.existsByUnitAndDatesOverlap(unit, start, end);
    }
}