package springboot.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;

import java.time.LocalDate;
import java.util.List;

@RepositoryRestResource(path = "unitReservation")
public interface UnitReservationRepo extends JpaRepository<UnitReservation, Long> {
    // Ovo će automatski generirati query: SELECT * FROM unit_reservation JOIN person ... WHERE person.email = ?
    List<UnitReservation> findByPersonEmail(String email);

    @Query("SELECT COUNT(r) > 0 FROM UnitReservation r WHERE r.unit = :unit " +
            "AND r.status != 'Cancelled' " +
            "AND (:startDate < r.endDate AND :endDate > r.startDate)")
    boolean existsByUnitAndDatesOverlap(
            @Param("unit") Unit unit,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
