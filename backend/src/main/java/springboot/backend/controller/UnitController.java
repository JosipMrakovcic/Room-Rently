package springboot.backend.controller;

// springboot.backend.controller.UnitController

import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
// Uklonjeni import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import springboot.backend.dto.UnitFilterDTO;
import springboot.backend.dto.UnitCountDTO;
import springboot.backend.dto.UnitSummaryDTO;
import springboot.backend.model.Person;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.PersonRepo;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;
import springboot.backend.service.EmailService;
import springboot.backend.service.UnitService;

// Uklonjeni import java.time.LocalDate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/unit")
public class UnitController {

    @Autowired
    private UnitRepo repo;

    @Autowired
    private PersonRepo personRepo;

    @Autowired
    private UnitReservationRepo reservationRepo;

    @Autowired
    private UnitService unitService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/all")
    public List<Unit> getAllUnits() {
        return repo.findAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addUnit(@RequestBody Unit unit, @AuthenticationPrincipal Jwt jwt) {
        // Provjera je li token tu
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        // Izvlačenje emaila
        String email = jwt.getClaimAsString("email");
        if (email == null) return ResponseEntity.badRequest().body("No email in token.");

        // Traženje osobe u Person tablici pomoću personRepo-a
        Optional<Person> caller = personRepo.findByEmail(email);

        // Provjera je li osoba admin
        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can add units.");
        }
        if (unit.getPrice() != null && unit.getPrice() < 1) {
            return ResponseEntity.badRequest().body("Price must be a positive number.");
        }
        if (unit.getCapAdults() != null && unit.getCapAdults() < 1) {
            return ResponseEntity.badRequest().body("Cap of adults must be at least 1.");
        }

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

        Unit savedUnit = repo.save(unit);
        return ResponseEntity.ok(savedUnit);
    }

    @GetMapping("/{id}")
    public Optional<Unit> getUnitById(@PathVariable Long id) {
        return repo.findById(id);
    }


    @Transactional
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUnit(@PathVariable Long id, @RequestBody Unit unitPayload, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = personRepo.findByEmail(email);

        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can update units.");
        }
        try {
            if (unitPayload.getPrice() != null && unitPayload.getPrice() < 1) {
                return ResponseEntity.badRequest().body("Price can't be negative.");
            }
            Unit existingUnit = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Unit can't be found."));

            String[] ignoreProperties = {"idUnit", "listOfRooms", "parentUnit", "images", "unitReservations"};
            List<String> activeStatuses = Arrays.asList("Pending", "Confirmed");

            // Ažuriraj roditelja
            BeanUtils.copyProperties(unitPayload, existingUnit, ignoreProperties);

            if (!existingUnit.isApartment() && existingUnit.getNumSameRooms() != null) {
                List<Unit> currentRooms = existingUnit.getListOfRooms();
                int targetCount = existingUnit.getNumSameRooms();

                // BRISANJE
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
                        return ResponseEntity.badRequest().body(
                               "Some rooms have active reservations. You cannot reduce the number of rooms below " + currentRooms.size() + "."
                        );
                    }
                }

                // DODAVANJE
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

                // SINKRONIZACIJA I NUMERIRANJE (Od 1 do N)
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
            // Kopiramo sve ostale podatke (cijenu, opis...)
            BeanUtils.copyProperties(parent, room, ignoreProperties);

            // Formatiranje broja s vodećom nulom (npr. Soba 01) pomaže kod sortiranja u bazi
            String formattedIndex = String.format("%02d", i + 1);
            room.setUnitName(parent.getUnitName() + " - Soba " + formattedIndex);

            room.setParentUnit(parent);
        }
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<springboot.backend.dto.UnitTopRatedDTO>> getTopRated() {
        // Vraća 4 najbolje ocijenjena apartmana direktno iz baze
        return ResponseEntity.ok(repo.findTopRatedSimple(PageRequest.of(0, 4)));
    }

    @GetMapping("/counts-by-beds")
    public ResponseEntity<List<UnitCountDTO>> getCountsByBeds() {
        List<UnitCountDTO> result = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            result.add(new UnitCountDTO(
                    String.valueOf(i), // Broj kreveta kao label
                    repo.countTotalAvailableUnitsByBeds(i),
                    repo.findFirstImageUrlByBeds(i)
            ));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/counts-by-view")
    public ResponseEntity<List<UnitCountDTO>> getCountsByView() {
        String[] viewTypes = {"sea", "village", "lake"};
        List<UnitCountDTO> result = new ArrayList<>();
        for (String type : viewTypes) {
            result.add(new UnitCountDTO(
                    type,
                    repo.countTotalAvailableUnitsByView(type),
                    repo.findFirstImageUrlByView(type)
            ));
        }
        return ResponseEntity.ok(result);
    }
    @GetMapping("/summary")
    public ResponseEntity<List<UnitSummaryDTO>> getUnitSummaries() {
        return ResponseEntity.ok(repo.findAllSummaries());
    }


    @GetMapping("/filter")
    public List<UnitFilterDTO> filterUnits( // PROMIJENJEN TIP IZ List<Unit> U List<UnitFilterDTO>
                                            @RequestParam(required = false) String name,
                                            @RequestParam(required = false) Integer adults,
                                            @RequestParam(required = false) Integer children,
                                            @RequestParam(required = false) Integer rooms,
                                            @RequestParam(required = false) Integer beds,
                                            @RequestParam(required = false) Boolean isApartment,
                                            @RequestParam(required = false) Boolean seaView,
                                            @RequestParam(required = false) Boolean lakeView,
                                            @RequestParam(required = false) Boolean villageView,
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

        return unitService.filterUnitsDTO(
                name,
                adults,
                children,
                rooms,
                beds,
                isApartment,
                seaView,
                lakeView,
                villageView,
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
