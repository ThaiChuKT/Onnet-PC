package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminSessionItemResponse(
    Long sessionId,
    Long bookingId,
    Long userId,
    String userEmail,
    String userFullName,
    Long pcId,
    String pcLocation,
    Instant startTime,
    Instant endTime,
    BigDecimal totalCost,
    String status
) {
}
