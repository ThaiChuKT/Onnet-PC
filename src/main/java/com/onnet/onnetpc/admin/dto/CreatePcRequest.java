package com.onnet.onnetpc.admin.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreatePcRequest(
    @NotBlank(message = "specName is required") String specName,
    String cpu,
    String gpu,
    Integer ram,
    Integer storage,
    String operatingSystem,
    String description,
    @NotNull(message = "pricePerHour is required")
    @DecimalMin(value = "0.01", message = "pricePerHour must be greater than 0")
    BigDecimal pricePerHour,
    @NotBlank(message = "location is required") String location,
    String status
) {
}
