package com.onnet.onnetpc.wallet.dto;

import java.math.BigDecimal;

public record WalletSummaryResponse(Long walletId, BigDecimal balance) {
}
