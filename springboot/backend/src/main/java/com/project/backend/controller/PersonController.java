package com.project.backend.controller;


import com.project.backend.model.Person;
import com.project.backend.repository.PersonRepo;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
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
            return ResponseEntity
                    .status(409)
                    .body("User already exists");
        }

        Person person = new Person(email, true, false, false, name);
        repo.save(person);
        return ResponseEntity.ok("User added successfully");
    }

    @GetMapping("/{id}")
    public Optional<Person> getPersonById(@PathVariable Long id) {
        return repo.findById(id);
    }


    @DeleteMapping("/deletePerson/{id}")
    public void deletePerson(@PathVariable Long id) {
        repo.deleteById(id);
    }
}