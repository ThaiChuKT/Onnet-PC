package com.onnet.onnetpc.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminUserPaymentItemResponse(
    Long transactionId,
    Long walletId,
    Long userId,
    String userEmail,
    String userFullName,
    BigDecimal amount,
    String type,
    Long referenceId,
    String note,
    Instant createdAt
) {
}
