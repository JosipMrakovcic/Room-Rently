package com.project.backend.controller;

import com.project.backend.model.RoomImg;
import com.project.backend.repository.RoomImgRepo;
import com.project.backend.repository.RoomRepo;
import com.project.backend.model.Room;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RoomImgController {

    @Autowired
    RoomImgRepo repo;

    @Autowired
    RoomRepo roomRepo;

    @GetMapping("/allRoomImg")
    public List<RoomImg> getAllRoomImg() {
        return repo.findAll();
    }

    @PostMapping("/addRoomImg")
    public void addRoomImg(@RequestBody String imgInfo) {
        JSONObject obj = new JSONObject(imgInfo);
        Long roomId = obj.getLong("idRoom");
        String url = obj.getString("url");

        RoomImg img = new RoomImg();
        img.setUrl(url);
        roomRepo.findById(roomId).ifPresent(img::setRoom);

        repo.save(img);
    }
}
