package com.onnet.onnetpc.wallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TopUpRequest(@NotNull @DecimalMin(value = "1.0") BigDecimal amount) {
}
