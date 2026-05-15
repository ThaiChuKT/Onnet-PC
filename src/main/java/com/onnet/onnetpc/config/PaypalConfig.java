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
		return normalize(clientId);
	}

	public String getClientSecret() {
		return normalize(clientSecret);
	}

	public String getBaseUrl() {
		String normalized = normalize(baseUrl);
		if (normalized == null || normalized.isBlank()) {
			return "https://api-m.sandbox.paypal.com";
		}
		while (normalized.endsWith("/")) {
			normalized = normalized.substring(0, normalized.length() - 1);
		}
		return normalized;
	}

	public String getWebhookId() {
		return normalize(webhookId);
	}

	public String getFrontendBaseUrl() {
		String normalized = normalize(frontendBaseUrl);
		if (normalized == null || normalized.isBlank()) {
			return "http://localhost:5173";
		}
		while (normalized.endsWith("/")) {
			normalized = normalized.substring(0, normalized.length() - 1);
		}
		return normalized;
	}

	private String normalize(String value) {
		return value == null ? null : value.trim();
	}
}
