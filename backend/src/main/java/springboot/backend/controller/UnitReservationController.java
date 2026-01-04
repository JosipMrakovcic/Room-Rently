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
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.time.LocalDate;
import java.util.List;

import springboot.backend.service.PdfService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import springboot.backend.service.EmailService;

@RestController
@CrossOrigin(origins = "${frontend.url}")
@RequestMapping("/unitReservation")
public class UnitReservationController {

    @Autowired private UnitReservationRepo repo;
    @Autowired private PersonRepo personRepo;
    @Autowired private UnitRepo unitRepo;
    @Autowired private EmailService emailService;
    @Autowired private PdfService pdfService;

    @PostMapping("/add")
    public ResponseEntity<?> addReservation(@RequestBody ReservationRequest req, @AuthenticationPrincipal Jwt jwt) {
        try {
            // 1. Authentication check
            if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("You must be logged in.");

            String email = jwt.getClaimAsString("email");
            Person person = personRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found."));

            // 2. Role check (Strictly only Guests/Users can reserve)
            // Tip: Check if your person.isUser() accidentally returns true for admins
            if (!person.isUser()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only regular users can make reservations.");
            }

            // 3. Date validation
            if (req.getStartDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body("Start date cannot be in the past.");
            }
            if (!req.getEndDate().isAfter(req.getStartDate())) {
                return ResponseEntity.badRequest().body("Departure date must be at least one day after arrival.");
            }

            // 4. Double-booking prevention
            boolean isTaken = repo.existsOverlapping(req.getUnitId(), req.getStartDate(), req.getEndDate());
            if (isTaken) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("These dates are already taken. Please choose another period.");
            }

            // 5. Finding an available room (Parent unit or child room)
            Unit selectedUnit = unitRepo.findById(req.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Accommodation not found"));

            Unit unitToReserve = null;

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
                return ResponseEntity.badRequest().body("Unfortunately, no rooms of this type are available for the selected dates.");
            }

            // 6. Create reservation
            UnitReservation res = new UnitReservation();
            res.setStartDate(req.getStartDate());
            res.setEndDate(req.getEndDate());
            res.setAdults(req.getAdults());
            res.setChildren(req.getChildren());
            res.setStatus("Pending"); // Initial status
            res.setPerson(person);
            res.setUnit(unitToReserve);

            if (req.getAmenities() != null && !req.getAmenities().isEmpty()) {
                res.setSelectedAmenities(String.join(", ", req.getAmenities()));
            }

            // 7. Save to Database
            repo.save(res);

            // 8. Send PDF confirmation via Email
            try {
                emailService.sendEmailWithPdf(res);
                System.out.println("Email confirmation successfully sent to: " + email);
            } catch (Exception e) {
                System.err.println("Error sending email confirmation: " + e.getMessage());
            }

            return ResponseEntity.ok("Reservation successfully created for: " + unitToReserve.getUnitName() + ". A confirmation has been sent to your email.");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public List<UnitReservation> getAll() {
        return repo.findAll();
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<List<UnitReservation>> getMyReservations(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = jwt.getClaimAsString("email");
        List<UnitReservation> userReservations = repo.findByPersonEmail(email);
        return ResponseEntity.ok(userReservations);
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = jwt.getClaimAsString("email");

        return repo.findById(id).map(res -> {
            if (!res.getPerson().getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You cannot cancel someone else's reservation!");
            }

            res.setStatus("Cancelled");
            repo.save(res);
            return ResponseEntity.ok("Reservation #" + id + " has been successfully cancelled.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String emailOwner = jwt.getClaimAsString("email");
        Person p = personRepo.findByEmail(emailOwner).orElse(null);
        if (p == null || !p.isOwner()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only owners can change reservation status.");
        }

        return repo.findById(id).map(res -> {
            String newStatus = body.get("status");
            res.setStatus(newStatus);

            if ("Completed".equalsIgnoreCase(newStatus)) {
                res.setEndDate(LocalDate.now());
            }

            repo.save(res);

            // Send email based on new status
            try {
                if ("Confirmed".equalsIgnoreCase(newStatus)) {
                    emailService.sendStatusUpdateEmail(res, "YOUR RESERVATION IS CONFIRMED",
                            "We are pleased to inform you that the owner has confirmed your reservation. The official confirmation is attached.");
                } else if ("Cancelled".equalsIgnoreCase(newStatus)) {
                    emailService.sendStatusUpdateEmail(res, "RESERVATION CANCELLED",
                            "We inform you that your reservation has been cancelled. Details are attached below.");
                } else if ("Rejected".equalsIgnoreCase(newStatus)) {
                    emailService.sendStatusUpdateEmail(res, "RESERVATION REJECTED",
                            "Unfortunately, the owner had to reject your reservation request. Please find more information in the attached document.");
                }
            } catch (Exception e) {
                System.err.println("Error sending status update email: " + e.getMessage());
            }

            return ResponseEntity.ok(res);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/rate/{id}")
    public ResponseEntity<?> rateReservation(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> body, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        int ratingValue = body.get("rating");

        if (ratingValue < 1 || ratingValue > 10) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 10.");
        }

        return repo.findById(id).map(res -> {
            if (!res.getPerson().getEmail().equals(email)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot rate someone else's reservation!");
            }
            if (!"Completed".equalsIgnoreCase(res.getStatus())) {
                return ResponseEntity.badRequest().body("You can only rate completed reservations.");
            }
            if (LocalDate.now().isAfter(res.getEndDate().plusDays(3))) {
                return ResponseEntity.badRequest().body("The 3-day rating period has expired.");
            }
            if (res.getRating() != null) {
                return ResponseEntity.badRequest().body("You have already rated this reservation.");
            }

            res.setRating(ratingValue);
            res.setRatingDate(LocalDate.now());
            repo.save(res);
            return ResponseEntity.ok("Thank you for your rating!");
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/download-pdf/{id}")
    public void downloadPdf(@PathVariable Long id, HttpServletResponse response, @AuthenticationPrincipal Jwt jwt) throws IOException {
        if (jwt == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        UnitReservation res = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        String email = jwt.getClaimAsString("email");
        if (!res.getPerson().getEmail().equals(email)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "You do not have access to this document.");
            return;
        }

        response.setContentType("application/pdf");
        String fileName = "Reservation_" + res.getIdUnitReservation() + ".pdf";
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        pdfService.generateReservationPdf(response.getOutputStream(), res);
    }
}