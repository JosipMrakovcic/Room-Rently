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

    @Autowired private UnitImgRepo repo;
    @Autowired private UnitRepo unitRepo;

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload/{unitId}")
    @Transactional
    public ResponseEntity<?> uploadImage(@PathVariable Long unitId, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("File is empty");

        try {
            // 1. Kreiraj folder ako ne postoji
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Generiraj ime i spremi na disk
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 3. Pronađi Unit
            Unit unit = unitRepo.findById(unitId)
                    .orElseThrow(() -> new RuntimeException("Unit not found with ID: " + unitId));

            // 4. Kreiranje zapisa u bazi
            UnitImg img = new UnitImg();
            String dbPath = "/uploads/" + fileName;
            img.setUrl(dbPath);
            img.setUnit(unit);

            UnitImg saved = repo.save(img);

            // 5. Logiranje za provjeru
            System.out.println("Saved UnitImg: ID=" + saved.getId() + ", URL=" + saved.getUrl());

            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Disk error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database error: " + e.getMessage());
        }
    }
}
