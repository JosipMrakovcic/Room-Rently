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

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "${frontend.url}")
@RequestMapping("/unitImg")
public class UnitImgController {

    @Autowired
    private UnitImgRepo repo;

    @Autowired
    private UnitRepo unitRepo;

    // Osnovna putanja na serveru
    private final String BASE_UPLOAD_DIR = "uploads/units/";

    @PostMapping("/upload/{unitId}")
    @Transactional
    public ResponseEntity<?> uploadImage(@PathVariable Long unitId, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Datoteka je prazna.");
        }

        try {
            // 1. Definiraj putanju specifičnu za tu jedinicu (npr. uploads/units/5/)
            // Ovo osigurava da se na serveru stvori folder za točno tu sobu
            String unitFolderName = BASE_UPLOAD_DIR + unitId + "/";
            Path uploadPath = Paths.get(unitFolderName);

            // 2. Kreiraj foldere na serveru ako ne postoje
            // Files.createDirectories kreira i 'uploads' i 'units' i '{unitId}' odjednom
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 3. Generiraj jedinstveno ime datoteke (UUID sprječava prepisivanje slika)
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // 4. Kopiraj bajtove slike iz mrežnog requesta direktno na disk servera
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 5. Pronađi Unit u bazi
            Unit unit = unitRepo.findById(unitId)
                    .orElseThrow(() -> new RuntimeException("Unit nije pronađen s ID: " + unitId));

            // 6. Kreiraj zapis u bazi podataka
            // Putanja počinje s '/' kako bi frontend znao da je to apsolutna putanja na serveru
            UnitImg img = new UnitImg();
            String dbPath = "/" + unitFolderName + fileName;
            img.setUrl(dbPath);
            img.setUnit(unit);

            UnitImg saved = repo.save(img);

            // Logiranje putanje na serveru radi lakše provjere u konzoli
            System.out.println("Slika uspješno spremljena na server: " + filePath.toAbsolutePath());
            System.out.println("Putanja spremljena u bazu: " + saved.getUrl());

            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Greška pri pisanju na disk servera: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Greška u bazi podataka: " + e.getMessage());
        }
    }
}