package com.onnet.onnetpc.wallet.dto;

public record TopUpResponse(
	String paymentProvider,
	String status,
	String message,
	String orderId,
	String approvalUrl
) {
}
