package com.onnet.onnetpc.booking.dto;

public record BookingPaymentRequest(
    Boolean sendReceipt
) {
    public boolean shouldSendReceipt() {
        return sendReceipt == null || sendReceipt;
    }
}
