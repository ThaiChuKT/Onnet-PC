package com.onnet.onnetpc.users;

import com.onnet.onnetpc.common.response.ApiResponse;
import com.onnet.onnetpc.users.dto.ChangePasswordRequest;
import com.onnet.onnetpc.users.dto.ProfileResponse;
import com.onnet.onnetpc.users.dto.UpdateProfileRequest;
import com.onnet.onnetpc.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<ProfileResponse> getMyProfile(Authentication authentication) {
        return ApiResponse.success(userService.getProfile(authentication.getName()));
    }

    @PatchMapping
    public ApiResponse<ProfileResponse> updateMyProfile(
        Authentication authentication,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.success(userService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/change-password")
    public ApiResponse<String> changePassword(
        Authentication authentication,
        @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(authentication.getName(), request);
        return ApiResponse.success("Password changed successfully");
    }
}
