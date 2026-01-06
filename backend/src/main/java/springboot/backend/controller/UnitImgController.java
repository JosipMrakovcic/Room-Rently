package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import springboot.backend.model.Unit;
import springboot.backend.model.UnitImg;
import springboot.backend.repository.UnitImgRepo;
import springboot.backend.repository.UnitRepo;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import springboot.backend.repository.UnitReservationRepo;
import springboot.backend.service.EmailService;
import springboot.backend.service.FileCleanupService;

@RestController
@CrossOrigin(origins = "${frontend.url}")
@RequestMapping("/unitImg")
public class UnitImgController {


    @Autowired
    private UnitReservationRepo reservationRepo; // Treba nam za nalazak rezervacija

    @Autowired
    private EmailService emailService; // Treba nam za slanje PDF-a

    @Autowired
    private UnitImgRepo repo;

    @Autowired
    private UnitRepo unitRepo;

    // Osnovna putanja unutar projekta
    private final String BASE_UPLOAD_DIR = "uploads/units/";

    @Autowired
    private FileCleanupService cleanupService;

    @PostMapping("/upload/{unitId}")
    @Transactional
    public ResponseEntity<?> uploadImage(
            @PathVariable Long unitId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("isCover") boolean isCover) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Datoteka je prazna.");
        }

        try {
            Unit unit = unitRepo.findById(unitId)
                    .orElseThrow(() -> new RuntimeException("Unit nije pronađen s ID: " + unitId));

            // Određivanje foldera na temelju isCover (i === 0 iz Reacta)
            String subFolder = isCover ? "cover/" : "other/";
            String unitFolderRelative = BASE_UPLOAD_DIR + unitId + "/" + subFolder;
            Path uploadPath = Paths.get(unitFolderRelative);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            UnitImg img = new UnitImg();
            // URL spremamo s vodećim slashom za React frontend
            img.setUrl("/" + unitFolderRelative + fileName);
            img.setUnit(unit);

            UnitImg saved = repo.save(img);
            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Greška pri pisanju na disk: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        try {
            UnitImg img = repo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Slika nije pronađena s ID: " + id));

            String dbPath = img.getUrl();
            if (dbPath.startsWith("/")) {
                dbPath = dbPath.substring(1);
            }

            // Koristi user.dir da osiguraš točnu lokaciju na disku
            Path filePath = Paths.get(System.getProperty("user.dir")).resolve(dbPath);

            System.out.println("Pokušavam obrisati datoteku: " + filePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("Datoteka obrisana s diska.");
            }

            repo.delete(img);
            System.out.println("Zapis obrisan iz baze.");

            return ResponseEntity.ok("Slika uspješno obrisana.");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Greška pri brisanju: " + e.getMessage());
        }
    }

    @PutMapping("/set-cover/{unitId}/{imgId}")
    @Transactional
    public ResponseEntity<?> setCover(@PathVariable Long unitId, @PathVariable Long imgId) {
        // 1. Pronađi sve slike koje pripadaju tom unitu
        List<UnitImg> images = repo.findAll().stream()
                .filter(i -> i.getUnit().getIdUnit().equals(unitId))
                .toList();

        for (UnitImg img : images) {
            if (img.getId().equals(imgId)) {
                // Koristimo tvoju postojeću metodu iz kontrolera da je stavimo u cover/
                updateImageStatus(img.getId(), true);
            } else if (img.getUrl().contains("/cover/")) {
                // Sve ostale koje su bile cover vraćamo u other/
                updateImageStatus(img.getId(), false);
            }
        }
        return ResponseEntity.ok("Cover updated successfully");
    }

    @PutMapping("/update-status/{imgId}")
    @Transactional
    public ResponseEntity<?> updateImageStatus(@PathVariable Long imgId, @RequestParam boolean isCover) {
        try {
            UnitImg img = repo.findById(imgId)
                    .orElseThrow(() -> new RuntimeException("Slika nije pronađena."));

            String currentUrl = img.getUrl();
            // Definiramo gdje slika TREBA biti
            String targetSubFolder = isCover ? "cover/" : "other/";
            String expectedPathPart = "/" + targetSubFolder;

            // Ako je slika već u ispravnom folderu, samo potvrdi i izađi
            if (currentUrl.contains(expectedPathPart)) {
                return ResponseEntity.ok("Status je već ispravan.");
            }

            // 1. Priprema putanja
            String relativeOldPath = currentUrl.startsWith("/") ? currentUrl.substring(1) : currentUrl;
            Path source = Paths.get(System.getProperty("user.dir")).resolve(relativeOldPath);

            if (Files.exists(source)) {
                String fileName = source.getFileName().toString();

                // 2. Kreiranje novog foldera
                String newFolderRelative = BASE_UPLOAD_DIR + img.getUnit().getIdUnit() + "/" + targetSubFolder;
                Path targetDir = Paths.get(System.getProperty("user.dir")).resolve(newFolderRelative);

                if (!Files.exists(targetDir)) {
                    Files.createDirectories(targetDir);
                }

                Path targetFile = targetDir.resolve(fileName);

                // 3. Premještanje datoteke (REPLACE_EXISTING je ključno ako se nešto "zaglavilo")
                Files.move(source, targetFile, StandardCopyOption.REPLACE_EXISTING);

                // 4. Ažuriranje baze podataka s novim URL-om
                img.setUrl("/" + newFolderRelative + fileName);
                repo.save(img);

                return ResponseEntity.ok("Slika uspješno premještena u " + targetSubFolder);
            } else {
                // Ako datoteke nema, možda je već netko ručno obrisao ili premjestio
                return ResponseEntity.status(404).body("Datoteka nije pronađena na disku: " + source.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Greška pri ažuriranju statusa slike: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-full/{id}")
    @Transactional
    public ResponseEntity<?> deleteUnit(@PathVariable Long id) {
        System.out.println(">>> Zahtjev za potpuno brisanje Unita ID: " + id);

        // 1. Pronađi Unit (glavni objekt)
        Unit unit = unitRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit nije pronađen s ID: " + id));

        try {
            // --- NOVO: LOGIKA ZA REZERVACIJE I EMAIL ---

            // Skupi sve povezane unute (on + sobe)
            List<springboot.backend.model.Unit> allUnits = new java.util.ArrayList<>();
            allUnits.add(unit);
            if (unit.getListOfRooms() != null) {
                allUnits.addAll(unit.getListOfRooms());
            }

            // Nađi sve aktivne rezervacije (Pending i Confirmed)
            java.util.List<String> activeStatuses = java.util.Arrays.asList("Pending", "Confirmed");
            java.util.List<springboot.backend.model.UnitReservation> affectedReservations =
                    reservationRepo.findByUnitInAndStatusIn(allUnits, activeStatuses);

            System.out.println(">>> Broj pronađenih rezervacija za obavijest: " + affectedReservations.size());

            // Pošalji mailove
            for (springboot.backend.model.UnitReservation res : affectedReservations) {
                res.setStatus("Cancelled");

                // ZAMIJENI STARO SLANJE S OVIM:
                emailService.sendSimpleStatusEmail(
                        res,
                        "Important: Reservation Cancelled",
                        "We regret to inform you that the property '" + unit.getUnitName() + "' is no longer available. Your reservation has been cancelled."
                );
            }
            // --- KRAJ NOVE LOGIKE ---

            // 2. BRIŠEMO IZ BAZE (tek nakon što su mailovi poslani!)
            unitRepo.delete(unit);
            unitRepo.flush();
            System.out.println(">>> Unit " + id + " uspješno uklonjen iz baze.");

            // 3. OTPUŠTANJE FILE-HANDLERA (Windows cleanup)
            System.gc();

            // 4. POKRETANJE CLEANUP-A DISKA
            cleanupService.runFullCleanup();

            return ResponseEntity.ok("Unit ID: " + id + " i " + affectedReservations.size() + " rezervacija su obrađeni.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Kritična greška pri brisanju: " + e.getMessage());
        }
    }

}