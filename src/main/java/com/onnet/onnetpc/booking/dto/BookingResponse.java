package com.onnet.onnetpc.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BookingResponse(
    Long bookingId,
    Long pcId,
    String specName,
    String bookingType,
    Integer totalHours,
    Instant startTime,
    Instant endTime,
    BigDecimal totalPrice,
    String status
) {
}
