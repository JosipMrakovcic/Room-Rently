package com.project.backend;

import org.json.JSONObject;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@CrossOrigin
	@GetMapping("/")
	public String hello(@RequestParam(value = "name", defaultValue = "springBoot") String name) {
		return String.format("Hello %s", name);
	}

}
