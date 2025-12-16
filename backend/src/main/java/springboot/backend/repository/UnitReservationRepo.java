package springboot.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import springboot.backend.model.UnitReservation;

import java.util.List;

@RepositoryRestResource(path = "unitReservation")
public interface UnitReservationRepo extends JpaRepository<UnitReservation, Long> {
    // Ovo će automatski generirati query: SELECT * FROM unit_reservation JOIN person ... WHERE person.email = ?
    List<UnitReservation> findByPersonEmail(String email);
}
