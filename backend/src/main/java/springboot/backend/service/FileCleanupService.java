package springboot.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import springboot.backend.repository.UnitRepo;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FileCleanupService {

    @Autowired
    private UnitRepo unitRepo;

    @Autowired
    private FileService fileService;

    @EventListener(ApplicationReadyEvent.class)
    public void onStartupCleanup() {
        // Koristimo novi Thread kako bi main thread mogao završiti start aplikacije
        new Thread(() -> {
            try {
                // Dajemo serveru 10 sekundi prije nego krene S3 provjera
                Thread.sleep(10000);
                System.out.println(">>> [Supabase Cleanup] Pokrećem provjeru u pozadini...");
                runFullCleanup();
            } catch (Exception e) {
                System.err.println(">>> [Cleanup Background Error]: " + e.getMessage());
            }
        }).start();
    }

    public void runFullCleanup() {
        try {
            // Listamo SVE u bucketu (jer su ID-ovi u korijenu)
            // Šaljemo prazan string "" kao prefix da dobijemo sve iz bucketa "units"
            List<S3Object> objects = fileService.listAllObjects("");

            if (objects.isEmpty()) {
                System.out.println(">>> [Cleanup] Bucket je prazan.");
                return;
            }

            // Izvlačimo unitId iz prve komponente putanje (npr. "15/cover/img.jpg" -> 15)
            Set<Long> unitIdsInCloud = objects.stream()
                    .map(obj -> {
                        try {
                            String[] parts = obj.key().split("/");
                            if (parts.length > 0) {
                                return Long.parseLong(parts[0]); // Uzimamo prvi dio putanje
                            }
                        } catch (NumberFormatException e) {
                            return null; // Preskoči ako nije broj (npr. neki sistemski file)
                        }
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            System.out.println(">>> [Cleanup] Pronađeno unit foldera na cloudu: " + unitIdsInCloud);

            // Provjera i brisanje
            for (Long unitId : unitIdsInCloud) {
                if (!unitRepo.existsById(unitId)) {
                    System.out.println(">>> [Cleanup] Unit " + unitId + " ne postoji u bazi. Brišem SVE podatke...");
                    // Brišemo folder ID-a (npr. "15/") - to će obrisati i "15/cover/" i "15/other/"
                    fileService.deleteFolder(unitId + "/");
                }
            }
        } catch (Exception e) {
            System.err.println(">>> [Cleanup Error]: " + e.getMessage());
        }
    }
}