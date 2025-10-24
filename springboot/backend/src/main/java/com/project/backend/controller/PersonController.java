package com.project.backend.controller;


import com.project.backend.model.Person;
import com.project.backend.repository.PersonRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public void addPerson(@RequestBody Person person){
        repo.save(person);
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
