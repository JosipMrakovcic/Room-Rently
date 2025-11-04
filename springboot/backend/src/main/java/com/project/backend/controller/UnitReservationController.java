package com.project.backend.controller;

import com.project.backend.model.UnitReservation;
import com.project.backend.repository.UnitReservationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/unitReservation")
public class UnitReservationController {

    @Autowired
    private UnitReservationRepo repo;

    @GetMapping("/all")
    public List<UnitReservation> getAllReservations() {
        return repo.findAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReservation(@RequestBody UnitReservation res) {
        repo.save(res);
        return ResponseEntity.ok("Reservation added successfully");
    }

    @GetMapping("/{id}")
    public Optional<UnitReservation> getReservationById(@PathVariable Long id) {
        return repo.findById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteReservation(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
