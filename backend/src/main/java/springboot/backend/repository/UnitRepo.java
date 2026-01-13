package springboot.backend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import springboot.backend.dto.UnitFilterDTO;
import springboot.backend.dto.UnitSummaryDTO;
import springboot.backend.model.Unit;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UnitRepo extends JpaRepository<Unit, Long> {

    Optional<Unit> findByUnitName(String unitName);

    @Query("""
    SELECT new springboot.backend.dto.UnitFilterDTO(
        u.idUnit, 
        u.unitName, 
        u.price, 
        u.averageRating, 
        (SELECT img.url FROM UnitImg img WHERE img.unit = u ORDER BY img.id ASC LIMIT 1),
        u.location,
        u.apartment,
        u.numRooms,
        u.numBeds,
        u.capAdults,
        u.capChildren,
        u.hasWifi,
        u.hasParking,
        u.hasAirConditioning
    )
    FROM Unit u
    WHERE u.parentUnit IS NULL
    AND (:name IS NULL OR :name = '' OR LOWER(u.unitName) LIKE LOWER(CONCAT('%', :name, '%')))
    AND (:adults IS NULL OR u.capAdults >= :adults) 
    AND (:children IS NULL OR u.capChildren >= :children)
    AND (:rooms IS NULL OR u.numRooms >= :rooms)
    AND (:beds IS NULL OR u.numBeds >= :beds)
    AND (:isApartment IS NULL OR u.apartment = :isApartment)
    AND (:seaView IS NULL OR u.seaView = :seaView)
    AND (:lakeView IS NULL OR u.lakeView = :lakeView)
    AND (:villageView IS NULL OR u.villageView = :villageView)
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
    AND (
        CAST(:startDate AS date) IS NULL OR 
        CAST(:endDate AS date) IS NULL OR 
        NOT EXISTS (
            SELECT r FROM UnitReservation r
            WHERE r.unit = u
            AND r.status IN ('Confirmed', 'Pending')
            AND (r.startDate < :endDate AND r.endDate > :startDate)
        )
    )
""")
    List<UnitFilterDTO> filterUnitsDTO(
            @Param("name") String name,
            @Param("adults") Integer adults,
            @Param("children") Integer children,
            @Param("rooms") Integer rooms,
            @Param("beds") Integer beds,
            @Param("isApartment") Boolean isApartment,
            @Param("seaView") Boolean seaView,
            @Param("lakeView") Boolean lakeView,
            @Param("villageView") Boolean villageView,
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

    @Query("""
    SELECT SUM(CASE WHEN u.apartment = true THEN 1 ELSE COALESCE(u.numSameRooms, 1) END)
    FROM Unit u WHERE u.parentUnit IS NULL AND u.numBeds >= :beds
""")
    long countTotalAvailableUnitsByBeds(@Param("beds") int beds);

    @Query("""
    SELECT SUM(CASE WHEN u.apartment = true THEN 1 ELSE COALESCE(u.numSameRooms, 1) END)
    FROM Unit u WHERE u.parentUnit IS NULL AND 
    ((:type = 'sea' AND u.seaView = true) OR 
     (:type = 'village' AND u.villageView = true) OR 
     (:type = 'lake' AND u.lakeView = true))
""")
    long countTotalAvailableUnitsByView(@Param("type") String type);

    @Query("""
        SELECT new springboot.backend.dto.UnitTopRatedDTO(
            u.idUnit, 
            u.unitName, 
            u.price, 
            (SELECT i.url FROM UnitImg i WHERE i.unit = u ORDER BY i.id ASC LIMIT 1)
        )
        FROM Unit u 
        WHERE u.parentUnit IS NULL 
        ORDER BY u.averageRating DESC NULLS LAST, u.idUnit DESC
    """)
    List<springboot.backend.dto.UnitTopRatedDTO> findTopRatedSimple(Pageable pageable);

    // 2. BEDS IMAGE: Slika najbolje ocijenjenog apartmana s tim brojem kreveta
    @Query("""
        SELECT img.url FROM UnitImg img 
        WHERE img.unit.idUnit = (
            SELECT sub.idUnit FROM Unit sub 
            WHERE sub.parentUnit IS NULL AND sub.numBeds = :beds 
            ORDER BY sub.averageRating DESC NULLS LAST, sub.idUnit DESC 
            LIMIT 1
        ) 
        ORDER BY img.id ASC LIMIT 1
    """)
    String findFirstImageUrlByBeds(@Param("beds") int beds);

    // 3. VIEW IMAGE: Slika najbolje ocijenjenog apartmana za određeni pogled
    @Query("""
        SELECT img.url FROM UnitImg img 
        WHERE img.unit.idUnit = (
            SELECT sub.idUnit FROM Unit sub 
            WHERE sub.parentUnit IS NULL AND 
            ((:type = 'sea' AND sub.seaView = true) OR 
             (:type = 'village' AND sub.villageView = true) OR 
             (:type = 'lake' AND sub.lakeView = true))
            ORDER BY sub.averageRating DESC NULLS LAST, sub.idUnit DESC 
            LIMIT 1
        ) 
        ORDER BY img.id ASC LIMIT 1
    """)
    String findFirstImageUrlByView(@Param("type") String type);
    @Modifying
    @Transactional
    @Query(value = """
    UPDATE unit u SET average_rating = (
        SELECT COALESCE(AVG(CAST(r.rating AS DOUBLE PRECISION)), 0.0) 
        FROM unit_reservation r 
        WHERE (r.id_unit = u.id_unit OR r.id_unit IN (SELECT s.id_unit FROM unit s WHERE s.parent_unit_id = u.id_unit))
        AND r.status = 'Completed' 
        AND r.rating IS NOT NULL
    )
    WHERE u.id_unit = :unitId 
       OR u.id_unit = (SELECT parent_unit_id FROM unit WHERE id_unit = :unitId)
""", nativeQuery = true)
    void refreshUnitRating(@Param("unitId") Long unitId);
    @Query("SELECT new springboot.backend.dto.UnitSummaryDTO(u.idUnit, u.unitName, u.apartment, u.numSameRooms) " +
            "FROM Unit u WHERE u.parentUnit IS NULL")
    List<UnitSummaryDTO> findAllSummaries();

}