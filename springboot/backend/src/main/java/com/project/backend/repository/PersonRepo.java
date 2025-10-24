package com.project.backend.repository;


import com.project.backend.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path="person") //default je npr http://localhost:8080/persons
                                        //ali da budemo konzistentni s imenima tablica u bazi tu je hardcodirano /person
public interface PersonRepo extends JpaRepository<Person,Long>{
}
