package com.onnet.onnetpc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaypalConfig {

	@Value("${app.paypal.client-id:}")
	private String clientId;

	@Value("${app.paypal.client-secret:}")
	private String clientSecret;

	@Value("${app.paypal.base-url:https://api-m.sandbox.paypal.com}")
	private String baseUrl;

	@Value("${app.paypal.webhook-id:}")
	private String webhookId;

	@Value("${app.frontend.base-url:http://localhost:5173}")
	private String frontendBaseUrl;

	public String getClientId() {
		return clientId;
	}

	public String getClientSecret() {
		return clientSecret;
	}

	public String getBaseUrl() {
		return baseUrl;
	}

	public String getWebhookId() {
		return webhookId;
	}

	public String getFrontendBaseUrl() {
		return frontendBaseUrl;
	}
}
