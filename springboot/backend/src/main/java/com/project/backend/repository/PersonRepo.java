package com.project.backend.repository;

import com.project.backend.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(path = "person")
public interface PersonRepo extends JpaRepository<Person, Long> {
    Optional<Person> findByEmail(String email);
}
