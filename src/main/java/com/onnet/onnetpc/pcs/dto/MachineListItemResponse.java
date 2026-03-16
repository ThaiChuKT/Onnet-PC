package com.onnet.onnetpc.pcs.dto;

import java.math.BigDecimal;

public record MachineListItemResponse(
    Long pcId,
    Long specId,
    String specName,
    String cpu,
    String gpu,
    Integer ram,
    Integer storage,
    BigDecimal hourlyPrice,
    String location,
    String status
) {
}
