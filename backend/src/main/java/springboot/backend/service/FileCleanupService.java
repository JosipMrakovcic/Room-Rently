package springboot.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import springboot.backend.repository.UnitRepo;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileCleanupService {

    @Autowired
    private UnitRepo unitRepo;

    private final String BASE_UPLOAD_DIR = "uploads/units/";

    // Automatsko čišćenje pri paljenju Backenda
    @EventListener(ApplicationReadyEvent.class)
    public void onStartupCleanup() {
        System.out.println(">>> [Cleanup Service] Provjera zaostalih datoteka pri pokretanju...");
        runFullCleanup();
    }

    // Glavna metoda koja briše sve foldere čijih ID-ova nema u bazi
    public void runFullCleanup() {
        try {
            Path rootPath = Paths.get(System.getProperty("user.dir")).resolve(BASE_UPLOAD_DIR);
            File rootDir = rootPath.toFile();

            if (!rootDir.exists()) return;

            File[] folders = rootDir.listFiles(File::isDirectory);
            if (folders == null) return;

            for (File folder : folders) {
                try {
                    Long unitId = Long.parseLong(folder.getName());
                    // Ako Unit ID više ne postoji u bazi podataka
                    if (!unitRepo.existsById(unitId)) {
                        System.out.println(">>> [Cleanup] Pronađen siroče folder: " + unitId + ". Brišem...");
                        deleteRecursive(folder);
                    }
                } catch (NumberFormatException ignored) {
                    // Preskače foldere koji nisu brojevi
                }
            }
        } catch (Exception e) {
            System.err.println(">>> [Cleanup Error]: " + e.getMessage());
        }
    }

    // Robusna metoda za rekurzivno brisanje (ulazi u podfoldere 'cover' i 'other')
    public void deleteRecursive(File file) {
        File[] contents = file.listFiles();
        if (contents != null) {
            for (File f : contents) {
                deleteRecursive(f);
            }
        }
        file.setWritable(true);
        if (!file.delete()) {
            // Ako je folder zaključan (npr. OneDrive), označi ga za brisanje pri gašenju aplikacije
            file.deleteOnExit();
        }
    }
}