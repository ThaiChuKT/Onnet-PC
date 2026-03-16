package com.onnet.onnetpc.pcs.dto;

import java.math.BigDecimal;

public record SubscriptionPlanPriceResponse(Long id, String planName, Integer durationDays, BigDecimal price) {
}
