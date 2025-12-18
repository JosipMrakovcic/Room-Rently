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
    private UnitReservationRepo reservationRepo; // DODANO: Repozitorij za provjeru rezervacija

    public List<Unit> filterUnits(
            String name, Integer adults, Integer children, Integer rooms,
            Boolean isApartment, Boolean hasParking, Boolean hasWifi,
            Boolean hasBreakfast, Boolean hasTowels, Boolean hasShampoo,
            Boolean hasHairDryer, Boolean hasHeater, Boolean hasAirConditioning,
            BigDecimal minPrice, BigDecimal maxPrice,
            LocalDate startDate, LocalDate endDate
    ) {

        String searchName = StringUtils.hasText(name) ? name : null;

        // 1. Prvo dohvaćamo sve jedinice (roditelje) koji zadovoljavaju osnovne kriterije (cijena, oprema...)
        List<Unit> basicFilteredUnits = unitRepo.filterUnits(
                searchName, adults, children, rooms, isApartment,
                hasParking, hasWifi, hasBreakfast, hasTowels, hasShampoo,
                hasHairDryer, hasHeater, hasAirConditioning,
                minPrice, maxPrice, startDate, endDate
        );

        // 2. Ako nisu odabrani datumi, ne možemo provjeriti dostupnost, pa vraćamo sve
        if (startDate == null || endDate == null) {
            return basicFilteredUnits;
        }

        // 3. Dodatna filtracija: Provjera ima li Roditelj barem jedno slobodno Dijete (sobu)
        return basicFilteredUnits.stream()
                .filter(unit -> isUnitAvailable(unit, startDate, endDate))
                .collect(Collectors.toList());
    }

    private boolean isUnitAvailable(Unit unit, LocalDate start, LocalDate end) {
        // Slučaj A: Jedinica ima pod-sobe (Roditelj)
        if (unit.getListOfRooms() != null && !unit.getListOfRooms().isEmpty()) {
            // Vrati TRUE ako postoji BAREM JEDNO dijete koje nije zauzeto
            return unit.getListOfRooms().stream().anyMatch(child ->
                    !reservationRepo.existsByUnitAndDatesOverlap(child, start, end)
            );
        }

        // Slučaj B: Jedinica nema pod-sobe (Apartman ili samostalna jedinica)
        // Vrati TRUE ako sama jedinica nije zauzeta
        return !reservationRepo.existsByUnitAndDatesOverlap(unit, start, end);
    }
}