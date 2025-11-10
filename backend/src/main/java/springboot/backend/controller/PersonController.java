package springboot.backend.controller;



import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import springboot.backend.model.Person;
import springboot.backend.repository.PersonRepo;

import java.util.List;
import java.util.Optional;


@RestController
@CrossOrigin(origins = "${FRONTEND_URL}")
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

        person.setAdmin(isFirstUser);
        person.setOwner(false);
        person.setUser(true);

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

}