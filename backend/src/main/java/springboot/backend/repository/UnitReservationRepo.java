package springboot.backend.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;

import java.time.LocalDate;
import java.time.LocalDate;
import java.util.List;

@RepositoryRestResource(path = "unitReservation")
public interface UnitReservationRepo extends JpaRepository<UnitReservation, Long> {

    List<UnitReservation> findByUnitInAndStatusInAndEndDateAfter(List<Unit> units, List<String> statuses, LocalDate date);
    List<UnitReservation> findByPersonEmail(String email);
    List<UnitReservation> findByUnitInAndStatusIn(List<Unit> units, List<String> statuses);

    @Query("SELECT COUNT(r) > 0 FROM UnitReservation r WHERE r.unit = :unit " +
            "AND r.status != 'Cancelled' " +
            "AND (:startDate < r.endDate AND :endDate > r.startDate)")
    boolean existsByUnitAndDatesOverlap(
            @Param("unit") Unit unit,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COUNT(r) > 0 FROM UnitReservation r " +
            "WHERE r.unit.idUnit = :unitId " +
            "AND r.status IN ('Pending', 'Confirmed', 'Completed') " +
            "AND (:startDate < r.endDate AND :endDate > r.startDate)")
    boolean existsOverlapping(@Param("unitId") Long unitId,
                              @Param("startDate") LocalDate startDate,
                              @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM UnitReservation r WHERE r.status = 'Confirmed' AND r.endDate < :today")
    List<UnitReservation> findExpiredConfirmedReservations(@Param("today") String today);


    boolean existsByUnitAndStatusInAndEndDateAfter(Unit unit, List<String> statuses, LocalDate date);
}
