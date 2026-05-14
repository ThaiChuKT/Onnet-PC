package com.onnet.onnetpc.pcs.dto;

import java.math.BigDecimal;

public record TierSpecPlanPlanResponse(
    Long planId,
    String planName,
    Integer durationDays,
    BigDecimal price,
    Integer maxHoursPerDay,
    Boolean active
) {
}
