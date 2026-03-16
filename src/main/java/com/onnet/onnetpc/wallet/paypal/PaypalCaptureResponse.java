package com.onnet.onnetpc.wallet.paypal;

import java.math.BigDecimal;

public record PaypalCaptureResponse(String orderId, String status, String message, BigDecimal balance) {
}
