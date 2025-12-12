package com.project.backend.controller;

import com.project.backend.model.Unit;
import com.project.backend.repository.UnitRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/unit")
public class UnitController {

    @Autowired
    private UnitRepo repo;

    @GetMapping("/all")
    public List<Unit> getAllUnits() {
        return repo.findAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addUnit(@RequestBody Unit unit) {
        if (repo.findByUnitName(unit.getUnitName()).isPresent()) {
            return ResponseEntity
                    .status(409)
                    .body("Unit already exists");
        }
        repo.save(unit);
        return ResponseEntity.ok("Unit added successfully");
    }

    @GetMapping("/{id}")
    public Optional<Unit> getUnitById(@PathVariable Long id) {
        return repo.findById(id);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUnit(@PathVariable Long id) {
        repo.deleteById(id);
    }
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable Long id, @RequestBody Unit updatedUnit) {
        return repo.findById(id).map(existingUnit -> {
            updatedUnit.setIdUnit(id);
            repo.save(updatedUnit);
            return ResponseEntity.ok("Unit updated successfully");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @Autowired
    private UnitService unitService;

    @GetMapping("/filter")
    public List<Unit> filterUnits(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer adults,
            @RequestParam(required = false) Integer children,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Boolean isApartment,
            @RequestParam(required = false) Boolean hasParking,
            @RequestParam(required = false) Boolean hasWifi,
            @RequestParam(required = false) Boolean hasBreakfast,
            @RequestParam(required = false) Boolean hasAirConditioning,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return unitService.filterUnits(
                location,
                adults,
                children,
                minRating,
                isApartment,
                hasParking,
                hasWifi,
                hasBreakfast,
                hasAirConditioning,
                startDate,
                endDate
        );
    }



}
