package com.project.backend.controller;

import com.project.backend.model.Room;
import com.project.backend.repository.RoomRepo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RoomController {

    @Autowired
    RoomRepo repo;

    @GetMapping("/allRooms")
    public List<Room> getAllRooms() {
        return repo.findAll();
    }

    @PostMapping("/addRoom")
    public void addRoom(@RequestBody String roomInfo) {
        JSONObject obj = new JSONObject(roomInfo);
        Room r = new Room();
        r.setName(obj.getString("name"));
        r.setLocation(obj.getString("location"));
        r.setPrice(obj.getInt("price"));
        r.setNumBeds(obj.getInt("numBeds"));
        r.setRating(obj.getInt("rating"));
        r.setCapAdults(obj.getInt("capAdults"));
        r.setCapChildren(obj.getInt("capChildren"));
        r.setHasParking(obj.getBoolean("hasParking"));
        repo.save(r);
    }

    @GetMapping("/room/{id}")
    public Optional<Room> getRoomById(@PathVariable Long id) {
        return repo.findById(id);
    }

    @DeleteMapping("/deleteRoom/{id}")
    public void deleteRoom(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
