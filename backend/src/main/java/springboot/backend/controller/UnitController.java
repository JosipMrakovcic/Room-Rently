package springboot.backend.controller;

// springboot.backend.controller.UnitController

import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
// Uklonjeni import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import springboot.backend.model.Unit;
import springboot.backend.repository.UnitRepo;
import springboot.backend.service.UnitService;

// Uklonjeni import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalDate;
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

        // Ako nije apartman, generiramo sobe
        if (!unit.isApartment() && unit.getNumSameRooms() != null && unit.getNumSameRooms() > 0) {
            String originalName = unit.getUnitName();

            for (int i = 1; i <= unit.getNumSameRooms(); i++) {
                Unit room = new Unit();

                // Kopiramo sve osim ID-a i povezanih listi
                BeanUtils.copyProperties(unit, room, "idUnit", "listOfRooms", "parentUnit", "images", "unitReservations");

                // Postavljamo specifične vrijednosti za pod-sobu
                room.setUnitName(originalName + " - " + i);
                room.setApartment(false);
                room.setNumSameRooms(0);

                // Povezujemo sobu s glavnim unitom
                unit.addRoom(room);
            }
        }

        repo.save(unit);
        return ResponseEntity.ok("Unit added successfully");
    }

    @GetMapping("/{id}")
    public Optional<Unit> getUnitById(@PathVariable Long id) {
        return repo.findById(id);
    }


    @DeleteMapping("/delete/{id}")
    @Transactional // Osigurava da se cijela operacija brisanja (roditelj + djeca) izvrši u komadu
    public ResponseEntity<?> deleteUnit(@PathVariable Long id) {
        return repo.findById(id).map(unit -> {
            // Zahvaljujući cascade = CascadeType.ALL u klasi Unit,
            // brisanjem roditelja automatski se brišu sve sobe iz listOfRooms
            repo.delete(unit);
            return ResponseEntity.ok("Unit and all its sub-rooms deleted successfully");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    @Transactional
    public ResponseEntity<?> updateUnit(
            @PathVariable Long id,
            @RequestBody Unit updatedUnit
    ) {
        return repo.findById(id).map(existingUnit -> {
            // Polja koja ne diramo kod kopiranja
            String[] ignoreProperties = {
                    "idUnit", "listOfRooms", "parentUnit", "images", "unitReservations"
            };

            // 1. Ažuriramo osnovna polja glavnog unita
            BeanUtils.copyProperties(updatedUnit, existingUnit, ignoreProperties);

            // 2. LOGIKA ZA GENERIRANJE SOBA
            // Provjeravamo: ako NIJE apartman i ako je zadan broj soba > 0
            if (!existingUnit.isApartment() && existingUnit.getNumSameRooms() != null && existingUnit.getNumSameRooms() > 0) {

                // Prvo očistimo stare sobe
                existingUnit.getListOfRooms().clear();

                String baseName = existingUnit.getUnitName();

                for (int i = 1; i <= existingUnit.getNumSameRooms(); i++) {
                    Unit room = new Unit();

                    // Kopiramo sve postavke (cijena, parking, wifi...) s roditelja na svaku sobu
                    BeanUtils.copyProperties(existingUnit, room, ignoreProperties);

                    // Specifični podaci za sobu
                    room.setUnitName(baseName + " - Soba " + i);
                    room.setApartment(false);
                    room.setNumSameRooms(0); // Pod-soba nema svoje pod-sobe

                    // Povezujemo sobu s glavnim unitom
                    existingUnit.addRoom(room);
                }
            } else if (existingUnit.isApartment()) {
                // Ako je korisnik prebacio natrag na "Apartman", brišemo sve pod-sobe
                existingUnit.getListOfRooms().clear();
                existingUnit.setNumSameRooms(0);
            }

            repo.save(existingUnit);
            return ResponseEntity.ok("Unit updated and rooms regenerated successfully");
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
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        BigDecimal bdMinPrice = minPrice != null ? BigDecimal.valueOf(minPrice) : null;
        BigDecimal bdMaxPrice = maxPrice != null ? BigDecimal.valueOf(maxPrice) : null;

        // POZIV MORA PRATITI REDOSLIJED IZ UnitService.java
        return unitService.filterUnits(
                name,
                adults,
                children,
                rooms,
                isApartment,
                hasParking,
                hasWifi,
                hasBreakfast,
                hasTowels,
                hasShampoo,
                hasHairDryer,
                hasHeater,
                hasAirConditioning,
                bdMinPrice,
                bdMaxPrice,
                startDate,
                endDate
        );
    }
}
