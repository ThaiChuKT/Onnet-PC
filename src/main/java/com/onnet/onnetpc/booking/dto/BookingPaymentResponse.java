package com.onnet.onnetpc.booking.dto;

import java.math.BigDecimal;

public record BookingPaymentResponse(
    Long bookingId,
    String status,
    BigDecimal walletBalance,
    String message,
    Long mergedIntoBookingId
) {
}
