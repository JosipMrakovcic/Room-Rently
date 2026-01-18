package springboot.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;

import java.time.LocalDate;
import java.util.List;

public interface UnitReservationRepo extends JpaRepository<UnitReservation, Long> {

    // 1. KLJUČNO ZA OWNER DASHBOARD: EntityGraph rješava LazyInitialization i 500 Error
    @Override
    @EntityGraph(attributePaths = {"unit", "person", "unit.images"})
    List<UnitReservation> findAll();

    // 2. KLJUČNO ZA USER PROFILE: Da korisnik vidi slike smještaja uz rezervaciju
    @EntityGraph(attributePaths = {"unit", "unit.images"})
    List<UnitReservation> findByPersonEmail(String email);

    List<UnitReservation> findByUnitInAndStatusInAndEndDateAfter(List<Unit> units, List<String> statuses, LocalDate date);

    List<UnitReservation> findByUnitInAndStatusIn(List<Unit> units, List<String> statuses);

    @Query("SELECT COUNT(r) > 0 FROM UnitReservation r " +
            "WHERE r.unit.idUnit = :unitId " +
            "AND r.status IN ('Pending', 'Confirmed', 'Completed') " +
            "AND (:startDate < r.endDate AND :endDate > r.startDate)")
    boolean existsOverlapping(@Param("unitId") Long unitId,
                              @Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM UnitReservation r WHERE r.status = 'Confirmed' AND r.endDate < :today")
    List<UnitReservation> findExpiredConfirmedReservations(@Param("today") LocalDate today);

    boolean existsByUnitAndStatusInAndEndDateAfter(Unit unit, List<String> statuses, LocalDate date);

    @Query("""
        SELECT COUNT(r) > 0 FROM UnitReservation r 
        WHERE r.unit = :unit 
        AND r.status IN ('Pending', 'Confirmed', 'Completed') 
        AND (:startDate < r.endDate AND :endDate > r.startDate)
    """)
    boolean existsByUnitAndDatesOverlap(
            @Param("unit") Unit unit,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT COUNT(r) > 0 FROM UnitReservation r 
        WHERE r.unit.idUnit = :unitId 
        AND r.status IN ('Pending', 'Confirmed', 'Completed') 
        AND (:startDate < r.endDate AND :endDate > r.startDate)
    """)
    boolean isUnitOccupied(
            @Param("unitId") Long unitId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    @Query("""
    SELECT r FROM UnitReservation r 
    WHERE (r.unit.idUnit = :unitId OR r.unit.parentUnit.idUnit = :unitId) 
    AND r.status NOT IN ('Cancelled', 'Rejected')
""")
    List<UnitReservation> findOccupiedDatesByUnitId(@Param("unitId") Long unitId);
}