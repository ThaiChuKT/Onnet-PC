package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;

public record CreatePackageRequest(
    String planName,
    String cpu,
    String gpu,
    Integer ram,
    Integer storage,
    String operatingSystem,
    String description,
    String location,
    BigDecimal monthlyPrice,
    String tierName,
    Boolean active
) {
}
