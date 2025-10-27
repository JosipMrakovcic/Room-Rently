package com.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
// generira automatski gettere i settere za sva polja
// generira toString(), equals(), hashCode() metode
// gkraćuje kod jer ne moraš ručno pisati ove metode

@NoArgsConstructor
// stvara konstruktor bez argumenata (public Person() {})
// potrebno npr. za JPA, jer Hibernate koristi konstruktor bez argumenata
// za instanciranje objekata iz baze

@AllArgsConstructor
// stvara konstruktor sa svim poljima (public Person(Long id, String email, boolean isAdmin, ...))
// pomaže za brzo kreiranje objekta s vrijednostima svih polja

@Entity
// označava da je ova klasa JPA entitet, tj. da predstavlja tablicu u bazi podataka
// spring Boot/Hibernate koristi ovo za mapiranje objekata na redove u tablici

@Table(name = "person") // ime tablice iz SQL-a

public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //auto-increment dodane vrijednosti u bazu
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private boolean isAdmin;

    @Column(nullable = false)
    private boolean isUser;

    @Column(nullable = false)
    private boolean isOwner;

    @Column(nullable = false)
    private String name;

    public Person(String email, boolean isAdmin, boolean isUser, boolean isOwner, String name) {
        this.email = email;
        this.isAdmin = isAdmin;
        this.isUser = isUser;
        this.isOwner = isOwner;
        this.name = name;
    }
}