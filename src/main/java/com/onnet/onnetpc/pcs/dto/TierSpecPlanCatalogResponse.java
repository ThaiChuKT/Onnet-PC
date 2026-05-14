package com.onnet.onnetpc.pcs.dto;

import java.util.List;

public record TierSpecPlanCatalogResponse(
    List<TierSpecPlanTierResponse> tiers,
    List<TierSpecPlanSpecResponse> unassignedSpecs
) {
}
