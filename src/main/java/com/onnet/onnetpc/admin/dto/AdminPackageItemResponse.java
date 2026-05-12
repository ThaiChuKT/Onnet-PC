package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;

public record AdminPackageItemResponse(
    Long planId,
    String planName,
    Long specId,
    String specName,
    String tierName,
    Integer durationDays,
    BigDecimal price,
    Integer maxHoursPerDay,
    Boolean active
) {
}
