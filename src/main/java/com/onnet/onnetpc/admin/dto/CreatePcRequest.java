package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;

public record CreatePcRequest(
    Long specId,
    String specName,
    String cpu,
    String gpu,
    Integer ram,
    Integer storage,
    String operatingSystem,
    String description,
    BigDecimal pricePerHour,
    String location,
    String status
) {
}
