package com.onnet.onnetpc.pcs.dto;

import java.math.BigDecimal;
import java.util.List;

public record TierSpecPlanSpecResponse(
    Long specId,
    String specName,
    String cpu,
    String gpu,
    Integer ram,
    Integer storage,
    String operatingSystem,
    String description,
    BigDecimal pricePerHour,
    Boolean exclusive,
    Boolean available,
    List<TierSpecPlanPlanResponse> plans
) {
}
