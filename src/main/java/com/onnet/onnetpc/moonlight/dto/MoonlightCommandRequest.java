package com.onnet.onnetpc.moonlight.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record MoonlightCommandRequest(
    @Size(max = 20, message = "action cannot exceed 20 characters")
    String action,

    @Size(max = 20, message = "pin cannot exceed 20 characters")
    String pin,

    @Size(max = 100, message = "appName cannot exceed 100 characters")
    String appName,

    @Size(max = 20, message = "resolution cannot exceed 20 characters")
    String resolution,

    @Min(value = 1, message = "fps must be positive")
    @Max(value = 240, message = "fps is too high")
    Integer fps,

    @Min(value = 500, message = "bitrateKbps is too low")
    @Max(value = 150000, message = "bitrateKbps is too high")
    Integer bitrateKbps,

    Boolean executeOnServer
) {}
