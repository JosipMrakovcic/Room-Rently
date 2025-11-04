package com.project.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "unitImg")
public class UnitImg {

    @Id
    @Column(columnDefinition = "text", nullable = false)
    private String URL;

    @ManyToOne
    @JoinColumn(name = "idUnit", nullable = false)
    private Unit unit;

}
