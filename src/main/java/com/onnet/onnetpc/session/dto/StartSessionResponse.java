package com.onnet.onnetpc.session.dto;

import java.time.Instant;

public record StartSessionResponse(
    Long sessionId,
    Long bookingId,
    Long pcId,
    String pcLocation,
    Instant startedAt,
    Instant expectedEndTime,
    Long remainingSeconds,
    String connectionInfo,
    String status,
    String message
) {
}
