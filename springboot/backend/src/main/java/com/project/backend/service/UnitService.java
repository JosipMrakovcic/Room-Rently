package com.project.backend.service;

import com.project.backend.model.Unit;
import com.project.backend.repository.UnitRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UnitService {

    @Autowired
    private UnitRepo unitRepo;

    public List<Unit> filterUnits(
            String location,
            Integer adults,
            Integer children,
            Integer minRating,
            Boolean isApartment,
            Boolean hasParking,
            Boolean hasWifi,
            Boolean hasBreakfast,
            Boolean hasAirConditioning,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return unitRepo.filterUnits(
                location,
                adults,
                children,
                minRating,
                isApartment,
                hasParking,
                hasWifi,
                hasBreakfast,
                hasAirConditioning,
                startDate,
                endDate
        );
    }
}
