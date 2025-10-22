package com.project.backend;

import com.project.backend.model.ApiResponse;
import com.project.backend.model.User;
import org.json.JSONObject;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class BackendApplication {

	public User newUser;

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@CrossOrigin
	@GetMapping("/")
	public String hello(@RequestParam(value = "name", defaultValue = "springBoot") String name) {
		return String.format("Hello %s", name);
	}

	@PostMapping("/user")
	public String userInformation(@RequestBody String infoUser) {

		JSONObject obj = new JSONObject(infoUser);

		String id = obj.getString("sub");
		String name = obj.getString("name");
		String email = obj.getString("email");

		newUser = new User(id, name, email);
		return infoUser;
	}

	@GetMapping("/user")
	public ApiResponse userInformation(){
		ApiResponse res=new ApiResponse();
		res.setStatus(true);
		res.setMessage(newUser.getName() + " " + newUser.getId() + " " + newUser.getEmail());
		return res;
	}
}
