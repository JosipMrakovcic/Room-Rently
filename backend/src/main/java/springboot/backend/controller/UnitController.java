package springboot.backend.controller;

// springboot.backend.controller.UnitController

import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
// Uklonjeni import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;
import springboot.backend.service.UnitService;

// Uklonjeni import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/unit")
public class UnitController {

    @Autowired
    private UnitRepo repo;

    @Autowired
    private UnitReservationRepo reservationRepo;

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
                String formattedIndex = String.format("%02d", i);
                room.setUnitName(originalName + " - Soba " + formattedIndex);
                room.setApartment(false);
                room.setNumSameRooms(0);

                // Povezujemo sobu s glavnim unitom
                unit.addRoom(room);
            }
        }

        //repo.save(unit);
        //return ResponseEntity.ok("Unit added successfully"); OVO JE PROMIJENJENO

        Unit savedUnit = repo.save(unit);
        return ResponseEntity.ok(savedUnit);
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

    @Transactional
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable Long id, @RequestBody Unit unitPayload) {
        try {
            Unit existingUnit = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Smještaj nije pronađen."));

            String[] ignoreProperties = {"idUnit", "listOfRooms", "parentUnit", "images", "unitReservations"};
            List<String> activeStatuses = Arrays.asList("Pending", "Confirmed");

            // 1. Ažuriraj roditelja
            BeanUtils.copyProperties(unitPayload, existingUnit, ignoreProperties);

            if (!existingUnit.isApartment() && existingUnit.getNumSameRooms() != null) {
                List<Unit> currentRooms = existingUnit.getListOfRooms();
                int targetCount = existingUnit.getNumSameRooms();

                // A. BRISANJE
                if (targetCount < currentRooms.size()) {
                    List<String> busyRooms = new ArrayList<>();
                    for (int i = currentRooms.size() - 1; i >= targetCount; i--) {
                        Unit roomToDelete = currentRooms.get(i);
                        boolean hasBlockingReservations = reservationRepo.existsByUnitAndStatusInAndEndDateAfter(
                                roomToDelete, activeStatuses, LocalDate.now());

                        if (!hasBlockingReservations) {
                            currentRooms.remove(i);
                        } else {
                            busyRooms.add(roomToDelete.getUnitName());
                        }
                    }

                    if (!busyRooms.isEmpty()) {
                        // Ako nismo mogli obrisati sve, ažuriramo barem ono što je ostalo
                        syncSubRoomsAndSort(existingUnit, ignoreProperties);
                        existingUnit.setNumSameRooms(currentRooms.size());
                        repo.save(existingUnit);
                        return ResponseEntity.badRequest().body("Neke sobe nisu obrisane jer imaju aktivne rezervacije rezervacija.");
                    }
                }

                // B. DODAVANJE
                if (targetCount > currentRooms.size()) {
                    int toAdd = targetCount - currentRooms.size();
                    for (int i = 0; i < toAdd; i++) {
                        Unit newRoom = new Unit();
                        BeanUtils.copyProperties(existingUnit, newRoom, ignoreProperties);
                        // Privremeno ime, bit će prepisano u sync metodi
                        newRoom.setUnitName("Temp");
                        existingUnit.addRoom(newRoom);
                    }
                }

                // C. SINKRONIZACIJA I NUMERIRANJE (Od 1 do N)
                syncSubRoomsAndSort(existingUnit, ignoreProperties);
                existingUnit.setNumSameRooms(currentRooms.size());

            } else if (existingUnit.isApartment()) {
                existingUnit.getListOfRooms().clear();
                existingUnit.setNumSameRooms(0);
            }

            repo.save(existingUnit);
            return ResponseEntity.ok(existingUnit);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Greška: " + e.getMessage());
        }
    }

    private void syncSubRoomsAndSort(Unit parent, String[] ignoreProperties) {
        List<Unit> rooms = parent.getListOfRooms();

        for (int i = 0; i < rooms.size(); i++) {
            Unit room = rooms.get(i);
            // 1. Kopiraj sve ostale podatke (cijenu, opis...)
            BeanUtils.copyProperties(parent, room, ignoreProperties);

            // 2. Forsiraj ispravno ime prema redoslijedu (1, 2, 3...)
            // Formatiranje broja s vodećom nulom (npr. Soba 01) pomaže kod sortiranja u bazi
            String formattedIndex = String.format("%02d", i + 1);
            room.setUnitName(parent.getUnitName() + " - Soba " + formattedIndex);

            room.setParentUnit(parent);
        }
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<Unit>> getTopRated() {
        // 1. Dohvaćamo sve objekte
        List<Unit> allUnits = repo.findAll();

        List<Unit> topRated = allUnits.stream()
                .filter(u -> u.getParentUnit() == null) // Samo glavni objekti
                .sorted((u1, u2) -> {
                    Double r1 = u1.getAverageRating();
                    Double r2 = u2.getAverageRating();
                    return r2.compareTo(r1);
                })
                .limit(4)
                .toList();

        return ResponseEntity.ok(topRated);
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
