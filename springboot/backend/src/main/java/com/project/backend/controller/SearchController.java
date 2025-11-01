package com.project.backend.controller;

import com.project.backend.dto.SearchParams;
import com.project.backend.model.Apartment;
import com.project.backend.model.Room;
import com.project.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SearchController {

    private final SearchService service;

    @GetMapping("/apartments")
    public Page<Apartment> searchApartments(SearchParams p) {
        return service.searchApartments(p);
    }

    @GetMapping("/rooms")
    public Page<Room> searchRooms(SearchParams p) {
        return service.searchRooms(p);
    }
}
