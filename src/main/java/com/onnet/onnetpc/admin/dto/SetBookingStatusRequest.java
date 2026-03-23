package com.onnet.onnetpc.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record SetBookingStatusRequest(@NotBlank(message = "status is required") String status) {
}
