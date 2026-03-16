package com.onnet.onnetpc.pcs.dto;

import java.time.Instant;

public record ReviewSummaryResponse(Integer rating, String comment, Instant createdAt) {
}
