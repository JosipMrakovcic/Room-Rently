package com.project.backend.repository;

import com.project.backend.model.UnitReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "unitReservation")
public interface UnitReservationRepo extends JpaRepository<UnitReservation, Long> {
}
