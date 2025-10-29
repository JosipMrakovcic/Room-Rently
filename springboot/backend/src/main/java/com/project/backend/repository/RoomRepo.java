package com.project.backend.repository;

import com.project.backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@RepositoryRestResource(path="room")
public interface RoomRepo extends JpaRepository<Room, Long> {
}
