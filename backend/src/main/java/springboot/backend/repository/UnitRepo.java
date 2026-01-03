package springboot.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import springboot.backend.model.Unit;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UnitRepo extends JpaRepository<Unit, Long> {

    Optional<Unit> findByUnitName(String unitName);

    @Query("""
SELECT u FROM Unit u
WHERE 
    (:name IS NULL OR :name = '' OR LOWER(u.unitName) LIKE LOWER(CONCAT('%', :name, '%')))
    AND (:adults IS NULL OR u.capAdults >= :adults) 
    AND (:children IS NULL OR u.capChildren >= :children)
    AND (:rooms IS NULL OR u.numRooms >= :rooms)
    AND (:beds IS NULL OR u.numBeds >= :beds)
    AND (:isApartment IS NULL OR u.apartment = :isApartment)
    AND (:hasParking IS NULL OR u.hasParking = :hasParking)
    AND (:hasWifi IS NULL OR u.hasWifi = :hasWifi)
    AND (:hasBreakfast IS NULL OR u.hasBreakfast = :hasBreakfast)
    AND (:hasTowels IS NULL OR u.hasTowels = :hasTowels)
    AND (:hasShampoo IS NULL OR u.hasShampoo = :hasShampoo)
    AND (:hasHairDryer IS NULL OR u.hasHairDryer = :hasHairDryer)
    AND (:hasHeater IS NULL OR u.hasHeater = :hasHeater)
    AND (:hasAirConditioning IS NULL OR u.hasAirConditioning = :hasAirConditioning)
    AND (:minPrice IS NULL OR u.price >= :minPrice)
    AND (:maxPrice IS NULL OR u.price <= :maxPrice)
    AND NOT EXISTS (
        SELECT r FROM UnitReservation r
        WHERE r.unit = u
        AND r.status IN ('Confirmed', 'Pending')
        AND (
            CAST(:startDate AS date) IS NULL OR
            CAST(:endDate AS date) IS NULL OR
            (r.startDate < :endDate AND r.endDate > :startDate)))
""")
    List<Unit> filterUnits(
            @Param("name") String name,
            @Param("adults") Integer adults,
            @Param("children") Integer children,
            @Param("rooms") Integer rooms,
            @Param("beds") Integer beds, // NOVO: Dodano u potpis metode
            @Param("isApartment") Boolean isApartment,
            @Param("hasParking") Boolean hasParking,
            @Param("hasWifi") Boolean hasWifi,
            @Param("hasBreakfast") Boolean hasBreakfast,
            @Param("hasTowels") Boolean hasTowels,
            @Param("hasShampoo") Boolean hasShampoo,
            @Param("hasHairDryer") Boolean hasHairDryer,
            @Param("hasHeater") Boolean hasHeater,
            @Param("hasAirConditioning") Boolean hasAirConditioning,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}