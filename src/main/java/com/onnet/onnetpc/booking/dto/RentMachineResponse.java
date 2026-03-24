package com.onnet.onnetpc.booking.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record RentMachineResponse(
    Long bookingId,
    boolean queued,
    Integer queuePosition,
    Long sessionId,
    Long pcId,
    String pcLocation,
    String specName,
    Instant startTime,
    Instant expectedEndTime,
    BigDecimal totalPrice,
    BigDecimal walletBalance,
    String status,
    String message
) {
}
