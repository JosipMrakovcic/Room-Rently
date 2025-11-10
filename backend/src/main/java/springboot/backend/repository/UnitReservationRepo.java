package springboot.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import springboot.backend.model.UnitReservation;

@RepositoryRestResource(path = "unitReservation")
public interface UnitReservationRepo extends JpaRepository<UnitReservation, Long> {
}
