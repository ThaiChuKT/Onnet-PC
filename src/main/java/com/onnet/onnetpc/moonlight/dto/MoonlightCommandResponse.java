package com.onnet.onnetpc.moonlight.dto;

import java.time.Instant;

public record MoonlightCommandResponse(
    Long logId,
    Long hostId,
    String action,
    String status,
    boolean executedOnServer,
    String command,
    String output,
    String message,
    Instant createdAt,
    Instant finishedAt
) {}
