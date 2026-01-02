package springboot.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileService {

    private final String uploadDir = "uploads/units/";

    public String saveFile(MultipartFile file) throws IOException {
        // Kreiraj direktorij ako ne postoji
        Path copyLocation = Paths.get(uploadDir);
        if (!Files.exists(copyLocation)) {
            Files.createDirectories(copyLocation);
        }

        // Generiraj jedinstveno ime da izbjegneš preklapanja
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path targetPath = copyLocation.resolve(fileName);

        // Kopiraj datoteku
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return "/" + uploadDir + fileName; // Vraća putanju za bazu
    }
}