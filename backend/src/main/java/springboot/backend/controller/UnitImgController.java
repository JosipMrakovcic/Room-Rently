package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import springboot.backend.model.Person;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitImg;
import springboot.backend.model.UnitReservation;
import springboot.backend.repository.PersonRepo;
import springboot.backend.repository.UnitImgRepo;
import springboot.backend.repository.UnitRepo;
import springboot.backend.repository.UnitReservationRepo;
import springboot.backend.service.EmailService;
import springboot.backend.service.FileCleanupService;
import springboot.backend.service.FileService;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/unitImg")
public class UnitImgController {

    @Autowired
    private UnitReservationRepo reservationRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PersonRepo personRepo;

    @Autowired
    private UnitImgRepo repo;

    @Autowired
    private UnitRepo unitRepo;

    @Autowired
    private FileService fileService;

    @Autowired
    private FileCleanupService cleanupService;

    private final String BASE_S3_DIR = "";

    @PostMapping("/upload/{unitId}")
    @Transactional
    public ResponseEntity<?> uploadImage(
            @PathVariable Long unitId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("isCover") boolean isCover,
            @AuthenticationPrincipal Jwt jwt) { // DODAJ PARAMETAR

        // PROVJERA ADMINA (Isto kao u delete-full)
        if (jwt == null) return ResponseEntity.status(401).build();
        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = personRepo.findByEmail(email);
        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(403).body("Only admins can upload images.");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty.");
        }

        try {
            Unit unit = unitRepo.findById(unitId)
                    .orElseThrow(() -> new RuntimeException("Unit not found with ID: " + unitId));

            String subFolder = isCover ? "cover/" : "other/";
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String s3Path = BASE_S3_DIR + unitId + "/" + subFolder + fileName;

            // Puni URL iz Clouda
            String publicUrl = fileService.upload(s3Path, file);

            UnitImg img = new UnitImg();
            img.setUrl(publicUrl);
            img.setUnit(unit);

            UnitImg saved = repo.save(img);
            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error writing to Cloud:" + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<?> deleteImage(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) { // DODAJ PARAMETAR
        // PROVJERA ADMINA
        if (jwt == null) return ResponseEntity.status(401).build();
        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = personRepo.findByEmail(email);
        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(403).body("Only admins can delete images.");
        }
        try {
            UnitImg img = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Image not found with ID: " + id));

            // Brišemo s Clouda
            fileService.deleteFile(img.getUrl());

            repo.delete(img);
            return ResponseEntity.ok("Image successfully deleted.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while deleting: " + e.getMessage());
        }
    }

    @PutMapping("/set-cover/{unitId}/{imgId}")
    @Transactional
    public ResponseEntity<?> setCover(
            @PathVariable Long unitId,
            @PathVariable Long imgId,
            @AuthenticationPrincipal Jwt jwt) {

        // PROVJERA ADMINA
        if (jwt == null) return ResponseEntity.status(401).build();
        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = personRepo.findByEmail(email);
        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(403).body("Only admins can set cover image.");
        }

        try {
            List<UnitImg> images = repo.findByUnitIdUnit(unitId);

            for (UnitImg img : images) {
                // Koristimo Objects.equals da izbjegnemo NullPointerException i probleme s tipovima
                boolean isCurrentTarget = Objects.equals(img.getId(), imgId);

                if (isCurrentTarget) {
                    // Postavi novu sliku kao cover
                    performImageStatusUpdate(img.getId(), true);
                }
                else if (img.getUrl().contains("/cover/")) {
                    // Ako NIJE trenutna slika, a već je bila cover, vrati je u 'other'
                    performImageStatusUpdate(img.getId(), false);
                }
            }
            return ResponseEntity.ok("Cover updated successfully and old cover moved to other.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating cover: " + e.getMessage());
        }
    }

    @PutMapping("/update-status/{imgId}")
    @Transactional
    public ResponseEntity<?> updateImageStatusApi(@PathVariable Long imgId, @RequestParam boolean isCover, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = personRepo.findByEmail(email);
        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(403).body("Only admins can update status.");
        }

        try {
            performImageStatusUpdate(imgId, isCover);
            return ResponseEntity.ok("Image status updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    private void performImageStatusUpdate(Long imgId, boolean isCover) throws Exception {
        UnitImg img = repo.findById(imgId)
                .orElseThrow(() -> new RuntimeException("Image not found."));

        String currentUrl = img.getUrl();
        // Koristimo dosljedno 'targetSubFolder'
        String targetSubFolder = isCover ? "cover/" : "other/";

        // Provjeravamo točnu varijablu
        if (currentUrl.contains("/" + targetSubFolder)) {
            System.out.println(">>> S3 SKIP: Slika ID " + imgId + " je već u folderu: " + targetSubFolder);
            return;
        }

        // Izdvajanje imena datoteke
        String fileName = currentUrl.substring(currentUrl.lastIndexOf("/") + 1);

        // Generiranje nove putanje
        String newS3Path = BASE_S3_DIR + img.getUnit().getIdUnit() + "/" + targetSubFolder + fileName;

        // Cloud premještanje
        System.out.println(">>> S3 MOVING: Iz " + currentUrl + " u " + newS3Path);
        String newUrl = fileService.moveFile(currentUrl, newS3Path);

        img.setUrl(newUrl);
        repo.save(img);
    }

    @DeleteMapping("/delete-full/{id}")
    @Transactional
    public ResponseEntity<?> deleteUnit(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = personRepo.findByEmail(email);
        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(403).body("Only admins can delete units.");
        }
        System.out.println(">>> Zahtjev za potpuno brisanje Unita ID: " + id);

        Unit unit = unitRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found with ID: " + id));

        try {
            List<Unit> allUnits = new ArrayList<>();
            allUnits.add(unit);
            if (unit.getListOfRooms() != null) {
                allUnits.addAll(unit.getListOfRooms());
            }

            List<String> activeStatuses = Arrays.asList("Pending", "Confirmed");
            List<UnitReservation> affectedReservations =
                    reservationRepo.findByUnitInAndStatusIn(allUnits, activeStatuses);

            for (UnitReservation res : affectedReservations) {
                res.setStatus("Cancelled");
                emailService.sendSimpleStatusEmail(
                        res,
                        "Important: Reservation Cancelled",
                        "We regret to inform you that the property '" + unit.getUnitName() + "' is no longer available. Your reservation has been cancelled."
                );
            }

            unitRepo.delete(unit);
            unitRepo.flush();

            // Na Cloudu nema file locka, ali pozivamo cleanup da obriše Bucket folder
            cleanupService.runFullCleanup();

            return ResponseEntity.ok("Unit ID: " + id + " i " + affectedReservations.size() + " rezervacija su obrađeni.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Critical error while deleting: " + e.getMessage());
        }
    }
}