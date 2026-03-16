package com.onnet.onnetpc.auth.dto;

public record RegisterResponse(Long userId, String verificationToken, String message) {
}
