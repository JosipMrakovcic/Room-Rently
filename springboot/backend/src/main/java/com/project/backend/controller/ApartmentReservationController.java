package com.project.backend.controller;

import com.project.backend.model.ApartmentReservation;
import com.project.backend.repository.ApartmentReservationRepo;
import com.project.backend.repository.ApartmentRepo;
import com.project.backend.repository.PersonRepo;
import com.project.backend.model.Apartment;
import com.project.backend.model.Person;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ApartmentReservationController {

    @Autowired
    ApartmentReservationRepo repo;

    @Autowired
    ApartmentRepo apartmentRepo;

    @Autowired
    PersonRepo personRepo;

    @GetMapping("/allApartmentReservations")
    public List<ApartmentReservation> getAllApartmentReservations() {
        return repo.findAll();
    }

    @PostMapping("/addApartmentReservation")
    public void addApartmentReservation(@RequestBody String reservationInfo) {
        JSONObject obj = new JSONObject(reservationInfo);
        Long apartmentId = obj.getLong("idApartment");
        Long personId = obj.getLong("idPerson");

        ApartmentReservation res = new ApartmentReservation();
        //res.setStartDate(obj.getString("startDate"));
        //res.setEndDate(obj.getString("endDate"));
        res.setStartDate(LocalDate.parse(obj.getString("startDate")));
        res.setEndDate(LocalDate.parse(obj.getString("endDate")));
        res.setStatus(obj.getString("status"));

        apartmentRepo.findById(apartmentId).ifPresent(res::setApartment);
        personRepo.findById(personId).ifPresent(res::setPerson);

        repo.save(res);
    }
}
