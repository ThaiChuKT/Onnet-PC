package com.onnet.onnetpc.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RentMachineRequest(
    @NotNull(message = "specId is required")
    Long specId,

    @NotBlank(message = "rentalUnit is required")
    String rentalUnit,

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be at least 1")
    Integer quantity
) {
}
