package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springboot.backend.dto.ReservationRequest;
import springboot.backend.model.Person;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.PersonRepo;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;

import java.util.List;

@RestController
@CrossOrigin(origins = "${frontend.url}")
@RequestMapping("/unitReservation")
public class UnitReservationController {

    @Autowired private UnitReservationRepo repo;
    @Autowired private PersonRepo personRepo;
    @Autowired private UnitRepo unitRepo;

    @PostMapping("/add")
    public ResponseEntity<?> addReservation(@RequestBody ReservationRequest req) {
        try {
            UnitReservation res = new UnitReservation();
            res.setStartDate(req.getStartDate());
            res.setEndDate(req.getEndDate());
            res.setAdults(req.getAdults());
            res.setChildren(req.getChildren());
            res.setStatus("Pending"); // Inicijalni status

            // Pronalaženje osobe preko id-a
            Person person = personRepo.findById(req.getPersonId())
                    .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));
            res.setPerson(person);

            // Pronalaženje jedinice preko idUnit
            Unit unit = unitRepo.findById(req.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Smještaj nije pronađen"));
            res.setUnit(unit);
            if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
                res.setSelectedAmenities(String.join(", ", req.getAmenities()));
            }

            repo.save(res);
            return ResponseEntity.ok("Rezervacija uspješno poslana na čekanje!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Greška: " + e.getMessage());
        }
    }

    // Dohvaćanje rezervacija za određenog vlasnika (za dashboard)
    // Ovdje bi se mogla dodati logika da filtrira samo uniti koji pripadaju tom vlasniku
    @GetMapping("/all")
    public List<UnitReservation> getAll() {
        return repo.findAll();
    }
}