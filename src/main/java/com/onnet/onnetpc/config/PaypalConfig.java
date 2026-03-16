package com.onnet.onnetpc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaypalConfig {

	@Value("${app.paypal.client-id:}")
	private String clientId;

	@Value("${app.paypal.client-secret:}")
	private String clientSecret;

	public String getClientId() {
		return clientId;
	}

	public String getClientSecret() {
		return clientSecret;
	}
}
