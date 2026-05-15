package com.onnet.onnetpc.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

	private final String frontendBaseUrl;

	public HomeController(@Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
		this.frontendBaseUrl = frontendBaseUrl;
	}

	@GetMapping("/")
	public ResponseEntity<Void> home() {
		if (frontendBaseUrl == null || frontendBaseUrl.isBlank() || frontendBaseUrl.contains("localhost")) {
			return ResponseEntity.status(HttpStatus.OK).build();
		}

		return ResponseEntity.status(HttpStatus.FOUND)
			.header("Location", frontendBaseUrl)
			.build();
	}
}