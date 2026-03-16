package com.onnet.onnetpc.wallet.paypal;

public record PaypalOrderResponse(String orderId, String approvalUrl, String status) {
}
