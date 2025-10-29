package com.project.backend.repository;

import com.project.backend.model.RoomImg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path="roomImg")
public interface RoomImgRepo extends JpaRepository<RoomImg, Long> {
    List<RoomImg> findByRoom_IdRoom(Long idRoom);
}
