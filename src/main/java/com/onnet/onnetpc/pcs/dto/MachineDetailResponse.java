package com.onnet.onnetpc.pcs.dto;

import java.math.BigDecimal;
import java.util.List;

public record MachineDetailResponse(
    Long pcId,
    Long specId,
    String specName,
    String cpu,
    String gpu,
    Integer ram,
    Integer storage,
    String operatingSystem,
    String description,
    BigDecimal hourlyPrice,
    String location,
    String status,
    Boolean available,
    List<SubscriptionPlanPriceResponse> plans,
    List<ReviewSummaryResponse> approvedReviews
) {
}
