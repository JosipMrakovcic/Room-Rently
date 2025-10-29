package com.project.backend.controller;

import com.project.backend.model.Apartment;
import com.project.backend.repository.ApartmentRepo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ApartmentController {

    @Autowired
    ApartmentRepo repo;

    @GetMapping("/allApartments")
    public List<Apartment> getAllApartments() {
        return repo.findAll();
    }

    @PostMapping("/addApartment")
    public void addApartment(@RequestBody String apartmentInfo) {
        JSONObject obj = new JSONObject(apartmentInfo);
        Apartment a = new Apartment();
        a.setName(obj.getString("name"));
        a.setLocation(obj.getString("location"));
        a.setPrice(obj.getInt("price"));
        a.setNumRooms(obj.getInt("numRooms"));
        a.setCapAdults(obj.getInt("capAdults"));
        a.setCapChildren(obj.getInt("capChildren"));
        a.setNumBeds(obj.getInt("numBeds"));
        a.setRating(obj.getInt("rating"));
        a.setHasParking(obj.getBoolean("hasParking"));
        repo.save(a);
    }

    @GetMapping("/apartment/{id}")
    public Optional<Apartment> getApartmentById(@PathVariable Long id) {
        return repo.findById(id);
    }

    @DeleteMapping("/deleteApartment/{id}")
    public void deleteApartment(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
