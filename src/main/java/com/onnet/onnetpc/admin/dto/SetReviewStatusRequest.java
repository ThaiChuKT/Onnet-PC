package com.onnet.onnetpc.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record SetReviewStatusRequest(@NotBlank(message = "status is required") String status) {
}
