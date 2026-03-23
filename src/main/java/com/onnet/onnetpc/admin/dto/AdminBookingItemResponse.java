package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminBookingItemResponse(
    Long bookingId,
    String userEmail,
    String specName,
    Long pcId,
    String bookingType,
    Integer totalHours,
    Instant startTime,
    Instant endTime,
    BigDecimal totalPrice,
    String status,
    Instant createdAt
) {
}
