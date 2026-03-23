package com.onnet.onnetpc.admin.dto;

public record AdminUserItemResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String role,
    Boolean active,
    Boolean verified
) {
}
