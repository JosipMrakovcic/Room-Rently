package springboot.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import springboot.backend.model.Person;
import springboot.backend.repository.PersonRepo;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class PersonController {

    @Autowired
    PersonRepo repo;

    @Transactional(readOnly = true)
    @GetMapping("/allPersons")
    public ResponseEntity<?> getAllPersons(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = repo.findByEmail(email);

        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can view all users.");
        }

        List<Person> all = repo.findAll();
        return ResponseEntity.ok(all);
    }

    @Transactional
    @PostMapping("/addPerson")
    public ResponseEntity<?> addPerson(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");

        if (email == null) return ResponseEntity.badRequest().body("No email in token.");

        if (repo.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }

        Person person = new Person();
        person.setEmail(email);
        person.setName(name);

        boolean isFirstUser = repo.count() == 0;
        if (isFirstUser) {
            person.setAdmin(true);
            person.setOwner(false);
            person.setUser(false);
        } else {
            person.setAdmin(false);
            person.setOwner(false);
            person.setUser(true);
        }

        repo.save(person);
        return ResponseEntity.ok("User added successfully");
    }

    @Transactional(readOnly = true)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        Optional<Person> person = repo.findByEmail(email);

        if (person.isPresent()) {
            return ResponseEntity.ok(person.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<?> getPersonById(@PathVariable Long id) {
        Optional<Person> person = repo.findById(id);

        if (person.isPresent()) {
            return ResponseEntity.ok(person.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @Transactional
    @DeleteMapping("/deletePerson/{id}")
    public ResponseEntity<?> deletePerson(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        Optional<Person> caller = repo.findByEmail(email);

        if (caller.isEmpty() || !caller.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can delete.");
        }

        if (caller.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot delete yourself.");
        }

        repo.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }

    @Transactional
    @PutMapping("/updateRole/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Person roleUpdate, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String adminEmail = jwt.getClaimAsString("email");
        Optional<Person> admin = repo.findByEmail(adminEmail);

        if (admin.isEmpty() || !admin.get().isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admins only.");
        }

        Optional<Person> target = repo.findById(id);
        if (target.isEmpty()) return ResponseEntity.notFound().build();

        Person p = target.get();
        p.setAdmin(roleUpdate.isAdmin());
        p.setOwner(roleUpdate.isOwner());
        p.setUser(roleUpdate.isUser());

        repo.save(p);
        return ResponseEntity.ok("Role updated");
    }

    @Transactional
    @PutMapping("/updateCountry")
    public ResponseEntity<?> updateCountry(@RequestBody Map<String, String> payload, @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String email = jwt.getClaimAsString("email");
        String country = payload.get("country");
        String city = payload.get("city");

        if (email == null) {
            return ResponseEntity.badRequest().body("Invalid token: no email found.");
        }

        // 2. Koristimo 'repo' (naziv koji si definirao na vrhu klase kod @Autowired)
        return repo.findByEmail(email).map(person -> {
            person.setCountry(country);
            person.setCity(city);
            repo.save(person);
            return ResponseEntity.ok("Country updated successfully");
        }).orElse(ResponseEntity.status(404).body("User not found"));
    }
}