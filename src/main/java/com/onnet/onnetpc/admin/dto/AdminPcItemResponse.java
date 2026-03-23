package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;

public record AdminPcItemResponse(
    Long pcId,
    Long specId,
    String specName,
    String cpu,
    String gpu,
    Integer ram,
    Integer storage,
    String operatingSystem,
    BigDecimal pricePerHour,
    String location,
    String status
) {
}
