package com.onnet.onnetpc.wallet.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record WalletTransactionResponse(
    Long id,
    BigDecimal amount,
    String type,
    Long referenceId,
    String note,
    Instant createdAt
) {
}
