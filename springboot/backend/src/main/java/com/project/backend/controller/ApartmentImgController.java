package com.project.backend.controller;

import com.project.backend.model.ApartmentImg;
import com.project.backend.repository.ApartmentImgRepo;
import com.project.backend.repository.ApartmentRepo;
import com.project.backend.model.Apartment;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ApartmentImgController {

    @Autowired
    ApartmentImgRepo repo;

    @Autowired
    ApartmentRepo apartmentRepo;

    @GetMapping("/allApartmentImg")
    public List<ApartmentImg> getAllApartmentImg() {
        return repo.findAll();
    }

    @PostMapping("/addApartmentImg")
    public void addApartmentImg(@RequestBody String imgInfo) {
        JSONObject obj = new JSONObject(imgInfo);
        Long apartmentId = obj.getLong("idApartment");
        String url = obj.getString("url");

        ApartmentImg img = new ApartmentImg();
        img.setUrl(url);
        apartmentRepo.findById(apartmentId).ifPresent(img::setApartment);

        repo.save(img);
    }
}
