package com.project.backend.service;

import com.project.backend.dto.SearchParams;
import com.project.backend.model.Apartment;
import com.project.backend.model.Room;
import com.project.backend.repository.ApartmentRepo;
import com.project.backend.repository.RoomRepo;
import com.project.backend.spec.ApartmentSpecs;
import com.project.backend.spec.RoomSpecs;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final ApartmentRepo apartmentRepo;
    private final RoomRepo roomRepo;

    private Pageable pageable(SearchParams p){
        int page = p.getPage() == null ? 0 : Math.max(0, p.getPage());
        int size = p.getSize() == null ? 20 : Math.min(100, Math.max(1, p.getSize()));
        String sortBy = (p.getSort()==null) ? "price" : p.getSort();
        Sort.Direction dir = "desc".equalsIgnoreCase(p.getOrder()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(page, size, Sort.by(dir, sortBy));
    }

    public Page<Apartment> searchApartments(SearchParams p){
        return apartmentRepo.findAll(ApartmentSpecs.available(p), pageable(p));
    }

    public Page<Room> searchRooms(SearchParams p){
        return roomRepo.findAll(RoomSpecs.available(p), pageable(p));
    }
}
