package com.onnet.onnetpc.auth;

import com.onnet.onnetpc.auth.dto.AuthResponse;
import com.onnet.onnetpc.auth.dto.LoginRequest;
import com.onnet.onnetpc.auth.dto.RegisterRequest;
import com.onnet.onnetpc.auth.dto.RegisterResponse;
import com.onnet.onnetpc.auth.service.AuthService;
import com.onnet.onnetpc.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	public ApiResponse<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ApiResponse.success(authService.register(request));
	}

	@PostMapping("/login")
	public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return ApiResponse.success(authService.login(request));
	}

	@PostMapping("/verify-email/{token}")
	public ApiResponse<String> verifyEmail(@PathVariable String token) {
		authService.verifyEmail(token);
		return ApiResponse.success("Email verified successfully");
	}
}
