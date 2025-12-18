package springboot.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import springboot.backend.model.UnitReservation;

import java.util.List;

@RepositoryRestResource(path = "unitReservation")
public interface UnitReservationRepo extends JpaRepository<UnitReservation, Long> {

    List<UnitReservation> findByPersonEmail(String email);

    // Pronalazi samo potvrđene rezervacije kojima je endDate manji (prije) od proslijeđenog datuma
    @Query("SELECT r FROM UnitReservation r WHERE r.status = 'Confirmed' AND r.endDate < :today")
    List<UnitReservation> findExpiredConfirmedReservations(@Param("today") String today);
}