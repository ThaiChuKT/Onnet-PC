package com.onnet.onnetpc.moonlight.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateSunshineHostRequest(
    @Size(max = 120, message = "name cannot exceed 120 characters")
    String name,

    @Size(max = 255, message = "hostAddress cannot exceed 255 characters")
    String hostAddress,

    @Min(value = 1, message = "hostPort must be between 1 and 65535")
    @Max(value = 65535, message = "hostPort must be between 1 and 65535")
    Integer hostPort,

    @Size(max = 500, message = "notes cannot exceed 500 characters")
    String notes,

    Boolean enabled,

    Long pcId
) {}
