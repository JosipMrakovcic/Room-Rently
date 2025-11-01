package com.project.backend.repository;

import com.project.backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path="room")
public interface RoomRepo extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {
}
