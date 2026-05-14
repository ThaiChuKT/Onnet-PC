package com.onnet.onnetpc.pcs.dto;

import java.util.List;

public record TierSpecPlanTierResponse(
    Long tierId,
    String tierName,
    Integer tierLevel,
    Boolean active,
    List<TierSpecPlanSpecResponse> specs
) {
}
