package com.onnet.onnetpc.admin.dto;

import java.time.Instant;

public record AdminReviewItemResponse(
    Long reviewId,
    Long bookingId,
    Long pcId,
    String userEmail,
    Integer rating,
    String comment,
    String status,
    Instant createdAt
) {
}
