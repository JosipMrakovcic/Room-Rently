package com.project.backend.controller;

import com.project.backend.model.RoomReservation;
import com.project.backend.repository.RoomReservationRepo;
import com.project.backend.repository.RoomRepo;
import com.project.backend.repository.PersonRepo;
import com.project.backend.model.Room;
import com.project.backend.model.Person;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RoomReservationController {

    @Autowired
    RoomReservationRepo repo;

    @Autowired
    RoomRepo roomRepo;

    @Autowired
    PersonRepo personRepo;

    @GetMapping("/allRoomReservations")
    public List<RoomReservation> getAllRoomReservations() {
        return repo.findAll();
    }

    @PostMapping("/addRoomReservation")
    public void addRoomReservation(@RequestBody String reservationInfo) {
        JSONObject obj = new JSONObject(reservationInfo);
        Long roomId = obj.getLong("idRoom");
        Long personId = obj.getLong("idPerson");

        RoomReservation res = new RoomReservation();
//        res.setStartDate(obj.getString("startDate"));
//        res.setEndDate(obj.getString("endDate"));
        res.setStartDate(LocalDate.parse(obj.getString("startDate")));
        res.setEndDate(LocalDate.parse(obj.getString("endDate")));
        res.setStatus(obj.getString("status"));

        roomRepo.findById(roomId).ifPresent(res::setRoom);
        personRepo.findById(personId).ifPresent(res::setPerson);

        repo.save(res);
    }
}
