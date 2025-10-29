package com.project.backend.repository;

import com.project.backend.model.RoomReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@RepositoryRestResource(path="roomReservation")
public interface RoomReservationRepo extends JpaRepository<RoomReservation, Long> {
    List<RoomReservation> findByPerson_Id(Long personId);
    List<RoomReservation> findByRoom_IdRoom(Long roomId);
}
