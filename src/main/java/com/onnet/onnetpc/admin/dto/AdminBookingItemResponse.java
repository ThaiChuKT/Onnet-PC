package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminBookingItemResponse(
    Long bookingId,
    Long userId,
    String userFullName,
    String userEmail,
    String specName,
    Long pcId,
    String bookingType,
    Integer totalHours,
    Instant startTime,
    Instant endTime,
    BigDecimal totalPrice,
    String status,
    Instant createdAt,
    String planName,
    Integer durationDays
) {
}
