package com.onnet.onnetpc.moonlight.dto;

import java.time.Instant;

public record MoonlightCommandLogItemResponse(
    Long id,
    Long hostId,
    Long requestedByUserId,
    String action,
    String command,
    String status,
    String output,
    Instant createdAt,
    Instant finishedAt
) {}
