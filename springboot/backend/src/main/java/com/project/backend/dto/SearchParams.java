package com.project.backend.dto;

import lombok.Data;

@Data
public class SearchParams {
    private String startDate;
    private String endDate;
    private String q;
    private String location;
    private Integer adults;
    private Integer children;
    private Integer minBeds;
    private Boolean hasParking;
    private Double minRating;
    private Double priceMin;
    private Double priceMax;

    // soba u sklopu apartmana (opcionalno)
    private Long apartmentId;

    // sortiranje/paginacija
    private String sort;          // price|rating|name (default price)
    private String order;         // asc|desc (default asc)
    private Integer page;         // default 0
    private Integer size;         // default 20 (max 100)
}
