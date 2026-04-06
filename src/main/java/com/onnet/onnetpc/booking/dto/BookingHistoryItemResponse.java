package com.onnet.onnetpc.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BookingHistoryItemResponse(
    Long bookingId,
    Long pcId,
    String specName,
    boolean queued,
    Integer queuePosition,
    Integer totalHours,
    Instant startTime,
    Instant endTime,
    BigDecimal totalPrice,
    String status,
    Long remainingMinutes,
    Instant createdAt
) {
}
