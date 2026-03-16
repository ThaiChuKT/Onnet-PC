package com.onnet.onnetpc.users.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(@NotBlank String fullName, @NotBlank String phone, String avatar) {
}
