package com.project.backend.repository;

import com.project.backend.model.ApartmentImg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path="apartmentImg")
public interface ApartmentImgRepo extends JpaRepository<ApartmentImg, Long> {
    List<ApartmentImg> findByApartment_IdApartment(Long idApartment);
}
