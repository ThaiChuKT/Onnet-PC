package com.onnet.onnetpc.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record CreateBookingRequest(
    @NotNull(message = "pcId is required")
    Long pcId,

    @NotNull(message = "startTime is required")
    Instant startTime,

    @NotNull(message = "totalHours is required")
    @Min(value = 1, message = "totalHours must be at least 1")
    Integer totalHours
) {
}
