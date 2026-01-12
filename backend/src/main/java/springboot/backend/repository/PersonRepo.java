package springboot.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import springboot.backend.model.Person;

import java.util.Optional;

@Repository // Koristi običnu Repository anotaciju umjesto RepositoryRestResource
public interface PersonRepo extends JpaRepository<Person, Long> {
    Optional<Person> findByEmail(String email);
}