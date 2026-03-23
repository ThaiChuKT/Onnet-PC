package com.onnet.onnetpc.users.dto;

public record ProfileResponse(Long id, String fullName, String email, String phone, String avatar, String role) {
}
