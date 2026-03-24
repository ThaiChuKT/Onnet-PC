package com.onnet.onnetpc.session.dto;

import java.time.Instant;

public record ActiveSessionResponse(
    Long sessionId,
    Long bookingId,
    Long pcId,
    String pcLocation,
    Instant startedAt,
    Instant expectedEndTime,
    Long remainingSeconds,
    boolean warning15Minutes,
    String status,
    String message
) {
}
