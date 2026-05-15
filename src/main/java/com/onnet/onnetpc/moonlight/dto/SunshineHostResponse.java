package com.onnet.onnetpc.moonlight.dto;

import java.time.Instant;

public record SunshineHostResponse(
    Long id,
    String name,
    String hostAddress,
    Integer hostPort,
    Boolean enabled,
    String notes,
    Long pcId,
    Long createdByUserId,
    Instant createdAt,
    Instant updatedAt
) {}
