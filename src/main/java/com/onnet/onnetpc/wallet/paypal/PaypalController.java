package com.onnet.onnetpc.wallet.paypal;

import com.onnet.onnetpc.common.response.ApiResponse;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/paypal")
public class PaypalController {

	private final PaypalService paypalService;

	public PaypalController(PaypalService paypalService) {
		this.paypalService = paypalService;
	}

	@PostMapping("/orders")
	public ApiResponse<String> createOrder(@RequestBody CreatePaypalOrderRequest request) {
		return ApiResponse.success(paypalService.createOrder(request.amount()));
	}

	@PostMapping("/orders/{orderId}/capture")
	public ApiResponse<String> captureOrder(@PathVariable String orderId) {
		return ApiResponse.success(paypalService.captureOrder(orderId));
	}

	public record CreatePaypalOrderRequest(@NotNull @DecimalMin("1.0") BigDecimal amount) {
	}
}
