package springboot.backend.controller;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import springboot.backend.dto.OccupiedDateDTO;
import springboot.backend.dto.ReservationRequest;
import springboot.backend.model.Person;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.PersonRepo;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;
import org.springframework.http.HttpStatus;


import java.util.ArrayList;
import java.time.LocalDate;
import java.util.List;

import springboot.backend.service.PdfService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import springboot.backend.service.EmailService;

@RestController
@RequestMapping("/unitReservation")
public class UnitReservationController {

    @Autowired private UnitReservationRepo repo;
    @Autowired private PersonRepo personRepo;
    @Autowired private UnitRepo unitRepo;
    @Autowired private EmailService emailService;
    @Autowired private PdfService pdfService;

    @Transactional
    @PostMapping("/add")
    public ResponseEntity<?> addReservation(@RequestBody ReservationRequest req, @AuthenticationPrincipal Jwt jwt) {
        try {
            if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in.");

            String email = jwt.getClaimAsString("email");
            Person person = personRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found."));

            if (!person.isUser()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only regular users can make reservations.");
            }

            if (req.getStartDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body("Start date cannot be in the past.");
            }
            if (!req.getEndDate().isAfter(req.getStartDate())) {
                return ResponseEntity.badRequest().body("Departure date must be at least one day after arrival.");
            }

            Unit selectedUnit = unitRepo.findById(req.getUnitId()).orElseThrow(() -> new RuntimeException("Accommodation not found"));

            Unit unitToReserve = null;
            if (selectedUnit.getListOfRooms() != null && !selectedUnit.getListOfRooms().isEmpty()) {
                List<Unit> children = new ArrayList<>(selectedUnit.getListOfRooms());
                children.sort(java.util.Comparator.comparing(Unit::getIdUnit));
                for (Unit child : children) {
                    if (!repo.existsByUnitAndDatesOverlap(child, req.getStartDate(), req.getEndDate())) {
                        unitToReserve = child;
                        break;
                    }
                }
            } else {
                unitToReserve = selectedUnit;
            }

            if (unitToReserve == null) {
                return ResponseEntity.badRequest().body("No rooms available for selected dates.");
            }

            UnitReservation res = new UnitReservation();
            res.setStartDate(req.getStartDate());
            res.setEndDate(req.getEndDate());
            res.setAdults(req.getAdults());
            res.setChildren(req.getChildren());
            res.setStatus("Pending");
            res.setPerson(person);
            res.setUnit(unitToReserve);
            if (req.getAmenities() != null) res.setSelectedAmenities(String.join(", ", req.getAmenities()));

            repo.save(res);

            // ASINKRONO: Inquiry email (Status: Pending)
            emailService.sendEmailWithPdf(res);

            return ResponseEntity.ok("Reservation successfully created. A confirmation inquiry has been sent to: " + email);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/all")
    public ResponseEntity<?> getAll(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        Person p = personRepo.findByEmail(email).orElse(null);

        if (p == null || !p.isOwner()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Owners only.");
        }

        return ResponseEntity.ok(repo.findAll());
    }

    @Transactional(readOnly = true)
    @GetMapping("/my-reservations")
    public ResponseEntity<List<UnitReservation>> getMyReservations(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        // Vraćamo listu filtriranu po emailu korisnika
        return ResponseEntity.ok(repo.findByPersonEmail(email));
    }

    @Transactional
    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        String email = jwt.getClaimAsString("email");

        return repo.findById(id).map(res -> {
            if (!res.getPerson().getEmail().equals(email)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            res.setStatus("Cancelled");
            repo.save(res);

            emailService.sendSimpleStatusEmail(res, "Booking Cancelled",
                    "Your reservation #" + id + " has been successfully cancelled.");

            return ResponseEntity.ok("Cancelled.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String ownerEmail = jwt.getClaimAsString("email");
        Person p = personRepo.findByEmail(ownerEmail).orElse(null);
        if (p == null || !p.isOwner()) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        return repo.findById(id).map(res -> {
            String newStatus = body.get("status");

            if ("Completed".equalsIgnoreCase(newStatus)) {
                if (LocalDate.now().isBefore(res.getStartDate().plusDays(1))) {
                    return ResponseEntity.badRequest().body("Cannot complete before the first night.");
                }
                res.setEndDate(LocalDate.now());
            }

            res.setStatus(newStatus);
            repo.save(res);

            if ("Confirmed".equalsIgnoreCase(newStatus)) {
                emailService.sendStatusUpdateEmail(res, "Booking Confirmed",
                        "Excellent news! Your reservation has been confirmed by the host. We look forward to seeing you.");
            } else if ("Rejected".equalsIgnoreCase(newStatus)) {
                emailService.sendSimpleStatusEmail(res, "Reservation Declined",
                        "Unfortunately, the host was unable to accept your booking request for the selected dates.");
            } else {
                emailService.sendSimpleStatusEmail(res, "Reservation Update",
                        "The status of your reservation has been updated to: " + newStatus);
            }

            return ResponseEntity.ok(res);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/rate/{id}")
    public ResponseEntity<?> rateReservation(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> body, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        int rating = body.get("rating");

        return repo.findById(id).map(res -> {
            // Provjere (sigurnost)
            if (!res.getPerson().getEmail().equals(jwt.getClaimAsString("email"))) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            if (!"Completed".equalsIgnoreCase(res.getStatus())) return ResponseEntity.badRequest().body("Not completed.");
            if (res.getRating() != null) return ResponseEntity.badRequest().body("Already rated.");

            // Spremi ocjenu u rezervaciju
            res.setRating(rating);
            res.setRatingDate(LocalDate.now());
            repo.save(res);

            // Osvježi stupac average_rating u tablici UNIT
            unitRepo.refreshUnitRating(res.getUnit().getIdUnit());

            return ResponseEntity.ok("Rated!");
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional(readOnly = true)
    @GetMapping("/occupied-dates/{unitId}")
    public ResponseEntity<List<OccupiedDateDTO>> getOccupiedDates(@PathVariable Long unitId) {
        // Dohvati glavni Unit da znamo koliki mu je kapacitet (broj soba)
        Unit unit = unitRepo.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Unit not found"));

        // Ako je apartman, kapacitet je 1. Ako ima više soba, gledamo numSameRooms.
        int totalCapacity = (unit.isApartment() || unit.getNumSameRooms() == null || unit.getNumSameRooms() == 0)
                ? 1
                : unit.getNumSameRooms();

        // Dohvatiti sve rezervacije za taj tip smještaja
        List<UnitReservation> reservations = repo.findOccupiedDatesByUnitId(unitId);

        // Izbroji zauzetost po danima
        java.util.Map<LocalDate, Integer> dailyCount = new java.util.HashMap<>();
        for (UnitReservation res : reservations) {
            LocalDate current = res.getStartDate();
            // Prolazimo kroz sve noći rezervacije
            while (current.isBefore(res.getEndDate())) {
                dailyCount.put(current, dailyCount.getOrDefault(current, 0) + 1);
                current = current.plusDays(1);
            }
        }

        // Kreiraj listu samo za one dane koji su puni
        List<OccupiedDateDTO> fullyOccupied = new ArrayList<>();
        for (java.util.Map.Entry<LocalDate, Integer> entry : dailyCount.entrySet()) {
            if (entry.getValue() >= totalCapacity) {
                fullyOccupied.add(new OccupiedDateDTO(entry.getKey(), entry.getKey().plusDays(1)));
            }
        }

        return ResponseEntity.ok(fullyOccupied);
    }
}