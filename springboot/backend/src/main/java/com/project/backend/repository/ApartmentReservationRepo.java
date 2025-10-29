package com.project.backend.repository;

import com.project.backend.model.ApartmentReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@RepositoryRestResource(path="apartmentReservation")
public interface ApartmentReservationRepo extends JpaRepository<ApartmentReservation, Long> {
    List<ApartmentReservation> findByPerson_Id(Long personId);
    List<ApartmentReservation> findByApartment_IdApartment(Long apartmentId);
}
