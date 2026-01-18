package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import springboot.backend.model.LocationSettings;
import springboot.backend.repository.LocationRepo;

import java.util.Optional;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private LocationRepo repo;

    // Dohvaćanje adrese (GET) - dopusti svima ili provjeri admina
    @GetMapping
    public ResponseEntity<LocationSettings> getLocation() {
        // Dodajemo treći argument (null) jer @AllArgsConstructor to zahtijeva
        LocationSettings settings = repo.findById(1L)
                .orElse(new LocationSettings(1L, "", null));
        return ResponseEntity.ok(settings);
    }

    // Spremanje/Update adrese (POST)
    @PostMapping
    public ResponseEntity<?> saveLocation(@RequestBody LocationSettings settings, @AuthenticationPrincipal Jwt jwt) {
        // FIX ZA 401: Provjeravamo je li token prisutan
        if (jwt == null) {
            return ResponseEntity.status(401).body("You are not authorized!");
        }

        // Ovdje osiguravamo da se uvijek sprema pod ID 1 (jedna globalna adresa)
        settings.setId(1L);
        repo.save(settings);
        return ResponseEntity.ok("Address succesfully! added to the database!");
    }
}