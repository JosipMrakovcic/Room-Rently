package springboot.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springboot.backend.model.UnitImg;
import springboot.backend.repository.UnitImgRepo;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/unitImg")
public class UnitImgController {

    @Autowired
    private UnitImgRepo repo;

    @GetMapping("/all")
    public List<UnitImg> getAllImages() {
        return repo.findAll();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addImage(@RequestBody UnitImg img) {
        if (repo.existsById(img.getURL())) {
            return ResponseEntity
                    .status(409)
                    .body("Image already exists");
        }
        repo.save(img);
        return ResponseEntity.ok("Image added successfully");
    }

    @GetMapping("/{url}")
    public Optional<UnitImg> getImageByUrl(@PathVariable String url) {
        return repo.findById(url);
    }

    @DeleteMapping("/delete/{url}")
    public void deleteImage(@PathVariable String url) {
        repo.deleteById(url);
    }
}
