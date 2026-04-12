package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;

public record UpdatePackageRequest(
    BigDecimal price,
    Integer maxHoursPerDay,
    Boolean active
) {
}
