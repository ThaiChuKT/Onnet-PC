package com.onnet.onnetpc.wallet.paypal;

import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class PaypalService {

	public String createOrder(BigDecimal amount) {
		return "ORDER-" + UUID.randomUUID();
	}

	public String captureOrder(String orderId) {
		return "CAPTURED-" + orderId;
	}
}
