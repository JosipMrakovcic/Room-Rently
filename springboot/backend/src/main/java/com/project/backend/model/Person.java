package com.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "person")
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "text", nullable = false, unique = true)
    private String email;


    @Column(nullable = false)
    private boolean isAdmin;

    @Column(nullable = false)
    private boolean isUser;

    @Column(nullable = false)
    private boolean isOwner;


    @Column(columnDefinition = "text", nullable = false)
    private String name;


    public Person(String email, boolean isAdmin, boolean isUser, boolean isOwner, String name) {
        this.email = email;
        this.isAdmin = isAdmin;
        this.isUser = isUser;
        this.isOwner = isOwner;
        this.name = name;
    }

    @OneToMany(mappedBy = "person", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnitReservation> unitReservations;

}
