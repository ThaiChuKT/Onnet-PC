package com.onnet.onnetpc.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailCodeRequest(
    @NotBlank @Email String email,
    @NotBlank @Pattern(regexp = "^[0-9]{6}$", message = "must be a 6-digit code") String code
) {
}
