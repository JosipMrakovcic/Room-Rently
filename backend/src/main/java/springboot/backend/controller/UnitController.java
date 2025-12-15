package springboot.backend.controller;

// springboot.backend.controller.UnitController

import org.springframework.beans.factory.annotation.Autowired;
// Uklonjeni import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import springboot.backend.model.Unit;
import springboot.backend.repository.UnitRepo;
import springboot.backend.service.UnitService;

// Uklonjeni import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/unit")
public class UnitController {

    @Autowired
    private UnitRepo repo;

    @Autowired
    private UnitService unitService;

    @GetMapping("/all")
    public List<Unit> getAllUnits() {
        return repo.findAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addUnit(@RequestBody Unit unit) {
        if (repo.findByUnitName(unit.getUnitName()).isPresent()) {
            return ResponseEntity.status(409).body("Unit already exists");
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
    public ResponseEntity<?> updateUnit(
            @PathVariable Long id,
            @RequestBody Unit updatedUnit
    ) {
        return repo.findById(id).map(existingUnit -> {
            updatedUnit.setIdUnit(id);
            repo.save(updatedUnit);
            return ResponseEntity.ok("Unit updated successfully");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/filter")
    public List<Unit> filterUnits(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer adults,
            @RequestParam(required = false) Integer children,
            @RequestParam(required = false) Integer rooms,
            @RequestParam(required = false) Boolean isApartment,
            @RequestParam(required = false) Boolean hasParking,
            @RequestParam(required = false) Boolean hasWifi,
            @RequestParam(required = false) Boolean hasBreakfast,
            @RequestParam(required = false) Boolean hasTowels,
            @RequestParam(required = false) Boolean hasShampoo,
            @RequestParam(required = false) Boolean hasHairDryer,
            @RequestParam(required = false) Boolean hasHeater,
            @RequestParam(required = false) Boolean hasAirConditioning,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {

        BigDecimal bdMinPrice = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
        BigDecimal bdMaxPrice = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;
        return unitService.filterUnits(
                name,
                adults,
                children,
                rooms,
                isApartment,
                hasParking,
                hasWifi,
                hasBreakfast,
                hasTowels, // <-- DODANO
                hasShampoo, // <-- DODANO
                hasHairDryer, // <-- DODANO
                hasHeater, // <-- DODANO
                hasAirConditioning,
                bdMinPrice, // <-- PROSLIJEĐENO
                bdMaxPrice
        );
    }
}
