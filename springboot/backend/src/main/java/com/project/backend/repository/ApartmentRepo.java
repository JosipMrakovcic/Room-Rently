package com.project.backend.repository;

import com.project.backend.model.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@RepositoryRestResource(path="apartment")
public interface ApartmentRepo extends JpaRepository<Apartment, Long>, JpaSpecificationExecutor<Apartment> {
}

