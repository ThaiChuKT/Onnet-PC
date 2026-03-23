package com.onnet.onnetpc.booking.dto;

public record ReviewSubmitResponse(
    Long reviewId,
    String status,
    String message
) {
}
