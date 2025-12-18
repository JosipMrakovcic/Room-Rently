package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import springboot.backend.dto.ReservationRequest;
import springboot.backend.model.Person;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.PersonRepo;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;
import org.springframework.security.core.Authentication; // PAZI NA IMPORT!
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "${frontend.url}")
@RequestMapping("/unitReservation")
public class UnitReservationController {

    @Autowired private UnitReservationRepo repo;
    @Autowired private PersonRepo personRepo;
    @Autowired private UnitRepo unitRepo;

    @PostMapping("/add")
    public ResponseEntity<?> addReservation(@RequestBody ReservationRequest req, @AuthenticationPrincipal Jwt jwt) {
        try {
            if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Morate biti prijavljeni.");
            

            String email = jwt.getClaimAsString("email");
            Person person = personRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen."));

            if (!person.isUser()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Samo korisnici mogu rezervirati.");
            }

            if (req.getStartDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body("Datum početka ne može biti u prošlosti.");
            }
            if (!req.getEndDate().isAfter(req.getStartDate())) {
                return ResponseEntity.badRequest().body("Datum odlaska mora biti barem jedan dan nakon dolaska.");
            }
            // --- KLJUČNA SIGURNOSNA PROVJERA (ANTI-BURP) ---
            boolean isTaken = repo.existsOverlapping(req.getUnitId(), req.getStartDate(), req.getEndDate());
            if (isTaken) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Ovi datumi su već zauzeti. Molimo odaberite drugi termin.");
            }

            // 1. Dohvati jedinicu koju je korisnik odabrao (Roditelj, npr. "Double Room")
            Unit selectedUnit = unitRepo.findById(req.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Smještaj nije pronađen"));

            Unit unitToReserve = null;

            // 2. LOGIKA ZA REZERVACIJU DJECE
            // Provjeravamo 'listOfRooms'
            if (selectedUnit.getListOfRooms() != null && !selectedUnit.getListOfRooms().isEmpty()) {

                List<Unit> children = new ArrayList<>(selectedUnit.getListOfRooms());
                children.sort(java.util.Comparator.comparing(Unit::getIdUnit));

                for (Unit child : children) {
                    boolean isOccupied = repo.existsByUnitAndDatesOverlap(child, req.getStartDate(), req.getEndDate());

                    if (!isOccupied) {
                        unitToReserve = child;
                        break;
                    }
                }
            } else {
                unitToReserve = selectedUnit;
            }

            if (unitToReserve == null) {
                return ResponseEntity.badRequest().body("Nažalost, nema slobodnih soba ovog tipa u odabranom terminu.");
            }


            UnitReservation res = new UnitReservation();
            res.setStartDate(req.getStartDate());
            res.setEndDate(req.getEndDate());
            res.setAdults(req.getAdults());
            res.setChildren(req.getChildren());
            res.setStatus("Pending");
            res.setPerson(person);

            Unit unit = unitRepo.findById(req.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Smještaj nije pronađen"));
            res.setUnit(unitToReserve);

            if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
                res.setSelectedAmenities(String.join(", ", req.getAmenities()));
            }

            repo.save(res);
            return ResponseEntity.ok("Rezervacija uspješno kreirana za: " + unitToReserve.getUnitName());
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

    @GetMapping("/my-reservations")
    public ResponseEntity<List<UnitReservation>> getMyReservations(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Google token sadrži email u claimu "email"
        String email = jwt.getClaimAsString("email");

        List<UnitReservation> userReservations = repo.findByPersonEmail(email);
        return ResponseEntity.ok(userReservations);
    }

    // 2. Sigurno otkazivanje rezervacije
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Izvlačimo email iz JWT claim-a
        String email = jwt.getClaimAsString("email");

        return repo.findById(id).map(res -> {
            // Provjera: Pripada li rezervacija osobi s tim emailom?
            if (!res.getPerson().getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Ne možete otkazati tuđu rezervaciju!");
            }

            res.setStatus("Cancelled");
            repo.save(res);
            return ResponseEntity.ok("Rezervacija #" + id + " je uspješno otkazana.");
        }).orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = jwt.getClaimAsString("email");
        Person p = personRepo.findByEmail(email).orElse(null);
        if (p == null || !p.isOwner()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Samo vlasnici mogu mijenjati status rezervacije.");
        }

        return repo.findById(id).map(res -> {
            String newStatus = body.get("status");
            res.setStatus(newStatus);

            // --- NOVO: Ako je status Completed, postavi endDate na danas ---
            if ("Completed".equalsIgnoreCase(newStatus)) {
                res.setEndDate(LocalDate.now());
            }

            repo.save(res);
            return ResponseEntity.ok(res); // Vraćamo cijeli objekt da frontend vidi novi datum
        }).orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/rate/{id}")
    public ResponseEntity<?> rateReservation(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> body, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        int ratingValue = body.get("rating");

        if (ratingValue < 1 || ratingValue > 10) {
            return ResponseEntity.badRequest().body("Ocjena mora biti između 1 i 10.");
        }

        return repo.findById(id).map(res -> {
            // 1. Provjera vlasništva
            if (!res.getPerson().getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Ne možete ocijeniti tuđu rezervaciju!");
            }
            // 2. Provjera statusa
            if (!"Completed".equalsIgnoreCase(res.getStatus())) {
                return ResponseEntity.badRequest().body("Možete ocijeniti samo završene rezervacije.");
            }
            // 3. Provjera roka (3 dana od endDate)
            if (LocalDate.now().isAfter(res.getEndDate().plusDays(3))) {
                return ResponseEntity.badRequest().body("Rok za ocjenjivanje (3 dana) je prošao.");
            }
            // 4. Provjera je li već ocijenjeno
            if (res.getRating() != null) {
                return ResponseEntity.badRequest().body("Već ste ocijenili ovu rezervaciju.");
            }

            res.setRating(ratingValue);
            res.setRatingDate(LocalDate.now());
            repo.save(res);
            return ResponseEntity.ok("Hvala na ocjeni!");
        }).orElse(ResponseEntity.notFound().build());
    }
}