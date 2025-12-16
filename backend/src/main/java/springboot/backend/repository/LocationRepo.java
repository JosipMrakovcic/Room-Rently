package springboot.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import springboot.backend.model.LocationSettings;

public interface LocationRepo extends JpaRepository<LocationSettings, Long> {
}