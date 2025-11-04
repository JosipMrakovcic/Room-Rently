package com.project.backend.repository;

import com.project.backend.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(path = "unit")
public interface UnitRepo extends JpaRepository<Unit, Long> {
    Optional<Unit> findByUnitName(String unitName);
}
