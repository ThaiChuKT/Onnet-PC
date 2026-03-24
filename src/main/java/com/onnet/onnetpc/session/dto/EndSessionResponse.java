package com.onnet.onnetpc.session.dto;

import java.time.Instant;

public record EndSessionResponse(
    Long sessionId,
    Long bookingId,
    Instant endedAt,
    boolean noRefundApplied,
    String status,
    String message
) {
}
