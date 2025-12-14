package springboot.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import springboot.backend.model.Unit;

import java.util.Optional;

@RepositoryRestResource(path = "unit")
public interface UnitRepo extends JpaRepository<Unit, Long> {
    Optional<Unit> findByUnitName(String unitName);
    @Query("""
        SELECT u FROM Unit u
        WHERE 
            (:location IS NULL OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))
            AND (:adults IS NULL OR u.capAdults >= :adults)
            AND (:children IS NULL OR u.capChildren >= :children)
            AND (:minRating IS NULL OR u.rating >= :minRating)
            AND (:isApartment IS NULL OR u.apartment = :isApartment)
            AND (:hasParking IS NULL OR u.hasParking = :hasParking)
            AND (:hasWifi IS NULL OR u.hasWifi = :hasWifi)
            AND (:hasBreakfast IS NULL OR u.hasBreakfast = :hasBreakfast)
            AND (:hasAirConditioning IS NULL OR u.hasAirConditioning = :hasAirConditioning)
            AND NOT EXISTS (
                SELECT r FROM UnitReservation r
                WHERE r.unit = u
                  AND r.startDate <= :endDate
                  AND r.endDate >= :startDate
            )
        """)
    List<Unit> filterUnits(
            @Param("location") String location,
            @Param("adults") Integer adults,
            @Param("children") Integer children,
            @Param("minRating") Integer minRating,
            @Param("isApartment") Boolean isApartment,
            @Param("hasParking") Boolean hasParking,
            @Param("hasWifi") Boolean hasWifi,
            @Param("hasBreakfast") Boolean hasBreakfast,
            @Param("hasAirConditioning") Boolean hasAirConditioning,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
