package springboot.backend.controller;



import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import springboot.backend.model.Person;
import springboot.backend.repository.PersonRepo;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
public class PersonController {

    @Autowired
    PersonRepo repo;

    @GetMapping("/allPersons")
    public List<Person> getAllPersons() {
        return repo.findAll();
    }

    @PostMapping("/addPerson")
    public ResponseEntity<?> addPerson(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        if (email == null) {
            throw new RuntimeException("Invalid Google token: no email found.");
        }

        if (repo.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body("User already exists");
        }

        Person person = new Person();
        person.setEmail(email);
        person.setName(name);

        boolean isFirstUser = repo.count() == 0;

        if (isFirstUser) {
            // Prvi korisnik je SAMO Admin
            person.setAdmin(true);
            person.setOwner(false);
            person.setUser(false); // Admin nije običan "Guest"
        } else {
            // Svi ostali su po defaultu SAMO Useri (Gosti)
            person.setAdmin(false);
            person.setOwner(false);
            person.setUser(true);
        }

        repo.save(person);

        return ResponseEntity.ok("User added successfully" + (isFirstUser ? " (as admin)" : ""));
    }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        Optional<Person> person = repo.findByEmail(email);
        if (person.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        return ResponseEntity.ok(person.get());
    }

    @GetMapping("/{id}")
    public Optional<Person> getPersonById(@PathVariable Long id) {
        return repo.findById(id);
    }

    @DeleteMapping("/deletePerson/{id}")
    public ResponseEntity<?> deletePerson(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        Optional<Person> current = repo.findByEmail(email);

        if (current.isEmpty()) return ResponseEntity.status(403).body("Unauthorized");

        Person currentUser = current.get();
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.status(403).body("You cannot delete yourself!");
        }

        repo.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }
    @PutMapping("/updateRole/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Long id,
                                        @RequestBody Person roleUpdate,
                                        @AuthenticationPrincipal Jwt jwt) {
        // 1. Provjera je li trenutni korisnik admin
        String adminEmail = jwt.getClaimAsString("email");
        Person admin = repo.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (!admin.isAdmin()) {
            return ResponseEntity.status(403).body("Only admins can change roles!");
        }

        // 2. Pronalaženje korisnika kojeg mijenjamo
        return repo.findById(id).map(person -> {
            // Spriječimo admina da sam sebi makne admin prava
            if (person.getEmail().equals(adminEmail) && !roleUpdate.isAdmin()) {
                return ResponseEntity.badRequest().body("You cannot remove your own admin rights!");
            }

            // KLJUČNA IZMJENA: Prvo sve uloge stavljamo na false
            person.setAdmin(false);
            person.setOwner(false);
            person.setUser(false);

            // Zatim postavljamo samo onu ulogu koja je došla kao true u request body-ju
            // Na ovaj način korisnik ne može biti Owner i User u isto vrijeme
            if (roleUpdate.isAdmin()) {
                person.setAdmin(true);
            } else if (roleUpdate.isOwner()) {
                person.setOwner(true);
            } else {
                person.setUser(true); // Default ako ništa nije odabrano
            }

            repo.save(person);
            return ResponseEntity.ok("Role updated successfully for " + person.getEmail());
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/updateCountry")
    public ResponseEntity<?> updateCountry(@RequestBody Map<String, String> payload,
                                           @AuthenticationPrincipal Jwt jwt) {
        // 1. Koristimo 'jwt' za izvlačenje emaila kao i u ostalim metodama
        String email = jwt.getClaimAsString("email");
        String country = payload.get("country");

        if (email == null) {
            return ResponseEntity.badRequest().body("Invalid token: no email found.");
        }

        // 2. Koristimo 'repo' (naziv koji si definirao na vrhu klase kod @Autowired)
        return repo.findByEmail(email).map(person -> {
            person.setCountry(country);
            repo.save(person);
            return ResponseEntity.ok("Country updated successfully");
        }).orElse(ResponseEntity.status(404).body("User not found"));
    }
}