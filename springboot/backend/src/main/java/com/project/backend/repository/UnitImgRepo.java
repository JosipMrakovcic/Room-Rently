package com.project.backend.repository;

import com.project.backend.model.UnitImg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "unitImg")
public interface UnitImgRepo extends JpaRepository<UnitImg, String> {
}
