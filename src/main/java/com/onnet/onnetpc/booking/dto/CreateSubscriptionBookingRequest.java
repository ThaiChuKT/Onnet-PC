package com.onnet.onnetpc.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateSubscriptionBookingRequest(
    @NotNull(message = "specId is required")
    Long specId,

    @NotNull(message = "planId is required")
    Long planId,

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be at least 1")
    Integer quantity
) {
}