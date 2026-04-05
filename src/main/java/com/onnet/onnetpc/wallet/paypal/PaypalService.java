package com.onnet.onnetpc.wallet.paypal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.config.PaypalConfig;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.repository.UserRepository;
import com.onnet.onnetpc.wallet.Wallet;
import com.onnet.onnetpc.wallet.WalletTransaction;
import com.onnet.onnetpc.wallet.WalletTransactionType;
import com.onnet.onnetpc.wallet.repository.WalletRepository;
import com.onnet.onnetpc.wallet.repository.WalletTransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaypalService {

	private static final Logger logger = LoggerFactory.getLogger(PaypalService.class);
	private static final Duration PAYPAL_CONNECT_TIMEOUT = Duration.ofSeconds(5);
	private static final Duration PAYPAL_REQUEST_TIMEOUT = Duration.ofSeconds(10);

	private final PaypalConfig paypalConfig;
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final UserRepository userRepository;
	private final WalletRepository walletRepository;
	private final WalletTransactionRepository walletTransactionRepository;
	private final PaypalPaymentRepository paypalPaymentRepository;
	private final HttpClient httpClient;

	public PaypalService(
		PaypalConfig paypalConfig,
		UserRepository userRepository,
		WalletRepository walletRepository,
		WalletTransactionRepository walletTransactionRepository,
		PaypalPaymentRepository paypalPaymentRepository
	) {
		this.paypalConfig = paypalConfig;
		this.userRepository = userRepository;
		this.walletRepository = walletRepository;
		this.walletTransactionRepository = walletTransactionRepository;
		this.paypalPaymentRepository = paypalPaymentRepository;
		this.httpClient = HttpClient.newBuilder()
			.connectTimeout(PAYPAL_CONNECT_TIMEOUT)
			.build();
	}

	@Transactional
	public PaypalOrderResponse createOrder(String email, BigDecimal amount) {
		Wallet wallet = findWalletByEmail(email);
		BigDecimal normalizedAmount = normalizeAmount(amount);
		String accessToken = fetchAccessToken();

		String returnUrl = paypalConfig.getFrontendBaseUrl() + "/wallet?paypalStatus=success";
		String cancelUrl = paypalConfig.getFrontendBaseUrl() + "/wallet?paypalStatus=cancel";

		ObjectNode payload = objectMapper.createObjectNode();
		payload.put("intent", "CAPTURE");

		ArrayNode purchaseUnits = payload.putArray("purchase_units");
		ObjectNode purchaseUnit = purchaseUnits.addObject();
		ObjectNode amountNode = purchaseUnit.putObject("amount");
		amountNode.put("currency_code", "USD");
		amountNode.put("value", normalizedAmount.toPlainString());

		ObjectNode appContext = payload.putObject("application_context");
		appContext.put("brand_name", "ONNET PC");
		appContext.put("user_action", "PAY_NOW");
		appContext.put("return_url", returnUrl);
		appContext.put("cancel_url", cancelUrl);

		JsonNode response = sendJsonPost(
			paypalConfig.getBaseUrl() + "/v2/checkout/orders",
			accessToken,
			payload.toString(),
			HttpStatus.BAD_GATEWAY,
			"Failed to create PayPal order"
		);

		String orderId = response.path("id").asText("");
		String approvalUrl = findApprovalUrl(response);
		if (orderId.isBlank() || approvalUrl == null || approvalUrl.isBlank()) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "PayPal order response is missing approval data");
		}

		PaypalPayment payment = new PaypalPayment();
		payment.setWallet(wallet);
		payment.setAmount(normalizedAmount);
		payment.setPaymentMethod("paypal");
		payment.setPaymentStatus(PaypalPaymentStatus.pending);
		payment.setTransactionId(orderId);
		payment.setRefundable(Boolean.FALSE);
		paypalPaymentRepository.save(payment);

		return new PaypalOrderResponse(orderId, approvalUrl, "PENDING");
	}

	@Transactional
	public PaypalCaptureResponse captureOrder(String email, String orderId) {
		Wallet wallet = findWalletByEmail(email);
		BigDecimal currentBalance = wallet.getBalance() == null ? BigDecimal.ZERO : wallet.getBalance();
		PaypalPayment payment = paypalPaymentRepository.findByTransactionIdAndWalletIdForUpdate(orderId, wallet.getId())
			.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PayPal order not found for this wallet"));

		if (payment.getPaymentStatus() == PaypalPaymentStatus.success) {
			return new PaypalCaptureResponse(orderId, "COMPLETED", "Order already captured", currentBalance);
		}

		String accessToken = fetchAccessToken();
		JsonNode existingOrder = sendJsonGet(
			paypalConfig.getBaseUrl() + "/v2/checkout/orders/" + urlEncode(orderId),
			accessToken,
			HttpStatus.BAD_GATEWAY,
			"Failed to verify PayPal order status"
		);
		if ("COMPLETED".equalsIgnoreCase(extractCaptureStatus(existingOrder))) {
			return completeCaptureLocally(wallet, payment, orderId, currentBalance, existingOrder);
		}

		JsonNode response;
		try {
			response = sendJsonPost(
				paypalConfig.getBaseUrl() + "/v2/checkout/orders/" + urlEncode(orderId) + "/capture",
				accessToken,
				"{}",
				HttpStatus.BAD_GATEWAY,
				"Failed to capture PayPal order"
			);
		} catch (ApiException ex) {
			JsonNode latestOrder = sendJsonGet(
				paypalConfig.getBaseUrl() + "/v2/checkout/orders/" + urlEncode(orderId),
				accessToken,
				HttpStatus.BAD_GATEWAY,
				"Failed to verify PayPal order status"
			);
			if ("COMPLETED".equalsIgnoreCase(extractCaptureStatus(latestOrder))) {
				return completeCaptureLocally(wallet, payment, orderId, currentBalance, latestOrder);
			}
			throw ex;
		}

		String captureStatus = extractCaptureStatus(response);
		if (!"COMPLETED".equalsIgnoreCase(captureStatus)) {
			JsonNode latestOrder = sendJsonGet(
				paypalConfig.getBaseUrl() + "/v2/checkout/orders/" + urlEncode(orderId),
				accessToken,
				HttpStatus.BAD_GATEWAY,
				"Failed to verify PayPal order status"
			);
			if ("COMPLETED".equalsIgnoreCase(extractCaptureStatus(latestOrder))) {
				return completeCaptureLocally(wallet, payment, orderId, currentBalance, latestOrder);
			}
			throw new ApiException(HttpStatus.CONFLICT, "PayPal payment is still processing. Please try again shortly");
		}

		return completeCaptureLocally(wallet, payment, orderId, currentBalance, response);
	}

	@Transactional
	public void handleWebhook(HttpHeaders headers, String payload) {
		if (payload == null || payload.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Webhook payload is empty");
		}

		JsonNode event = parseJson(payload, HttpStatus.BAD_REQUEST, "Invalid PayPal webhook payload");
		verifyWebhookSignature(headers, event);

		String eventType = event.path("event_type").asText("");
		if (eventType.isBlank()) {
			logger.warn("PayPal webhook received without event_type");
			return;
		}

		switch (eventType) {
			case "PAYMENT.CAPTURE.COMPLETED" -> handleCaptureCompletedWebhook(event);
			case "PAYMENT.CAPTURE.DENIED" -> handleCaptureDeniedWebhook(event);
			case "CHECKOUT.ORDER.APPROVED", "CHECKOUT.ORDER.COMPLETED", "CHECKOUT.ORDER.CANCELLED" -> {
				logger.info("PayPal webhook event received: {}", eventType);
			}
			default -> logger.debug("Ignored unsupported PayPal webhook event: {}", eventType);
		}
	}

	@Transactional
	public void reconcilePendingPayments(String email) {
		Wallet wallet = findWalletByEmail(email);
		String accessToken = fetchAccessToken();

		for (PaypalPayment payment : paypalPaymentRepository
			.findTop10ByWalletIdAndPaymentStatusOrderByCreatedAtDesc(wallet.getId(), PaypalPaymentStatus.pending)) {
			String orderId = payment.getTransactionId();
			if (orderId == null || orderId.isBlank()) {
				continue;
			}

			PaypalPayment lockedPayment = paypalPaymentRepository.findByTransactionIdForUpdate(orderId).orElse(null);
			if (lockedPayment == null || lockedPayment.getPaymentStatus() != PaypalPaymentStatus.pending) {
				continue;
			}

			try {
				JsonNode order = sendJsonGet(
					paypalConfig.getBaseUrl() + "/v2/checkout/orders/" + urlEncode(orderId),
					accessToken,
					HttpStatus.BAD_GATEWAY,
					"Failed to verify PayPal order status"
				);
				String status = extractCaptureStatus(order);

				if ("COMPLETED".equalsIgnoreCase(status)) {
					BigDecimal currentBalance = wallet.getBalance() == null ? BigDecimal.ZERO : wallet.getBalance();
					completeCaptureLocally(wallet, lockedPayment, orderId, currentBalance, order);
					continue;
				}

				if ("APPROVED".equalsIgnoreCase(status) || "CREATED".equalsIgnoreCase(status)) {
					JsonNode capture = sendJsonPost(
						paypalConfig.getBaseUrl() + "/v2/checkout/orders/" + urlEncode(orderId) + "/capture",
						accessToken,
						"{}",
						HttpStatus.BAD_GATEWAY,
						"Failed to capture PayPal order"
					);
					if ("COMPLETED".equalsIgnoreCase(extractCaptureStatus(capture))) {
						BigDecimal currentBalance = wallet.getBalance() == null ? BigDecimal.ZERO : wallet.getBalance();
						completeCaptureLocally(wallet, lockedPayment, orderId, currentBalance, capture);
					}
				}
			} catch (Exception ex) {
				logger.warn("Failed to reconcile PayPal order {} for wallet {}", orderId, wallet.getId(), ex);
			}
		}
	}

	private PaypalCaptureResponse completeCaptureLocally(
		Wallet wallet,
		PaypalPayment payment,
		String orderId,
		BigDecimal currentBalance,
		JsonNode paypalPayload
	) {
		if (payment.getPaymentStatus() == PaypalPaymentStatus.success) {
			return new PaypalCaptureResponse(orderId, "COMPLETED", "Order already captured", wallet.getBalance());
		}

		BigDecimal capturedAmount = resolveCapturedAmount(payment, paypalPayload);

		wallet.setBalance(currentBalance.add(capturedAmount));
		wallet.setUpdatedAt(Instant.now());
		walletRepository.save(wallet);

		payment.setAmount(capturedAmount);
		payment.setPaymentStatus(PaypalPaymentStatus.success);
		payment.setPaidAt(Instant.now());
		paypalPaymentRepository.save(payment);

		recordTopUpTransactionIfAbsent(wallet, payment, capturedAmount, orderId);

		return new PaypalCaptureResponse(orderId, "COMPLETED", "Wallet topped up successfully", wallet.getBalance());
	}

	private void recordTopUpTransactionIfAbsent(Wallet wallet, PaypalPayment payment, BigDecimal amount, String orderId) {
		Long referenceId = payment.getId();
		if (referenceId == null) {
			return;
		}

		boolean alreadyRecorded = walletTransactionRepository.existsByWalletIdAndTypeAndReferenceId(
			wallet.getId(),
			WalletTransactionType.top_up,
			referenceId
		);
		if (alreadyRecorded) {
			return;
		}

		try {
			WalletTransaction walletTransaction = new WalletTransaction();
			walletTransaction.setWallet(wallet);
			walletTransaction.setAmount(amount);
			walletTransaction.setType(WalletTransactionType.top_up);
			walletTransaction.setReferenceId(referenceId);
			walletTransaction.setNote("PayPal top-up order " + orderId);
			walletTransactionRepository.save(walletTransaction);
		} catch (DataIntegrityViolationException ex) {
			logger.info(
				"Skip duplicate wallet transaction for walletId={}, paymentId={}, orderId={}",
				wallet.getId(),
				referenceId,
				orderId
			);
		} catch (Exception ignored) {
			// Keep capture successful even if local transaction history insert fails.
		}
	}

	private void handleCaptureCompletedWebhook(JsonNode event) {
		String orderId = extractOrderIdFromWebhook(event);
		if (orderId.isBlank()) {
			logger.warn("PAYMENT.CAPTURE.COMPLETED webhook missing order id");
			return;
		}

		PaypalPayment payment = paypalPaymentRepository.findByTransactionIdForUpdate(orderId)
			.orElse(null);
		if (payment == null) {
			logger.warn("No local payment found for PayPal order {} during webhook processing", orderId);
			return;
		}

		if (payment.getPaymentStatus() == PaypalPaymentStatus.success) {
			return;
		}

		Wallet wallet = payment.getWallet();
		BigDecimal currentBalance = wallet.getBalance() == null ? BigDecimal.ZERO : wallet.getBalance();
		JsonNode paypalPayload = event.path("resource");
		completeCaptureLocally(wallet, payment, orderId, currentBalance, paypalPayload);
	}

	private void handleCaptureDeniedWebhook(JsonNode event) {
		String orderId = extractOrderIdFromWebhook(event);
		if (orderId.isBlank()) {
			logger.warn("PAYMENT.CAPTURE.DENIED webhook missing order id");
			return;
		}

		PaypalPayment payment = paypalPaymentRepository.findByTransactionIdForUpdate(orderId)
			.orElse(null);
		if (payment == null) {
			logger.warn("No local payment found for denied PayPal order {}", orderId);
			return;
		}

		if (payment.getPaymentStatus() == PaypalPaymentStatus.pending) {
			payment.setPaymentStatus(PaypalPaymentStatus.failed);
			paypalPaymentRepository.save(payment);
		}
	}

	private void verifyWebhookSignature(HttpHeaders headers, JsonNode webhookEvent) {
		String webhookId = paypalConfig.getWebhookId();
		if (webhookId == null || webhookId.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "PayPal webhook id is not configured");
		}

		String transmissionId = requireHeader(headers, "PAYPAL-TRANSMISSION-ID");
		String transmissionTime = requireHeader(headers, "PAYPAL-TRANSMISSION-TIME");
		String certUrl = requireHeader(headers, "PAYPAL-CERT-URL");
		String authAlgo = requireHeader(headers, "PAYPAL-AUTH-ALGO");
		String transmissionSig = requireHeader(headers, "PAYPAL-TRANSMISSION-SIG");

		ObjectNode payload = objectMapper.createObjectNode();
		payload.put("transmission_id", transmissionId);
		payload.put("transmission_time", transmissionTime);
		payload.put("cert_url", certUrl);
		payload.put("auth_algo", authAlgo);
		payload.put("transmission_sig", transmissionSig);
		payload.put("webhook_id", webhookId);
		payload.set("webhook_event", webhookEvent);

		String accessToken = fetchAccessToken();
		JsonNode verification = sendJsonPost(
			paypalConfig.getBaseUrl() + "/v1/notifications/verify-webhook-signature",
			accessToken,
			payload.toString(),
			HttpStatus.BAD_GATEWAY,
			"Failed to verify PayPal webhook signature"
		);

		String verificationStatus = verification.path("verification_status").asText("");
		if (!"SUCCESS".equalsIgnoreCase(verificationStatus)) {
			throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid PayPal webhook signature");
		}
	}

	private String requireHeader(HttpHeaders headers, String headerName) {
		String value = headers.getFirst(headerName);
		if (value == null || value.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Missing PayPal webhook header: " + headerName);
		}
		return value;
	}

	private String extractOrderIdFromWebhook(JsonNode event) {
		String orderId = event.path("resource")
			.path("supplementary_data")
			.path("related_ids")
			.path("order_id")
			.asText("");
		if (!orderId.isBlank()) {
			return orderId;
		}

		String eventType = event.path("event_type").asText("");
		if (eventType.startsWith("CHECKOUT.ORDER.")) {
			orderId = event.path("resource").path("id").asText("");
		}

		return orderId;
	}

	private JsonNode parseJson(String raw, HttpStatus status, String message) {
		try {
			return objectMapper.readTree(raw);
		} catch (Exception ex) {
			throw new ApiException(status, message);
		}
	}

	private BigDecimal resolveCapturedAmount(PaypalPayment payment, JsonNode paypalPayload) {
		if (payment.getAmount() != null && payment.getAmount().compareTo(BigDecimal.ZERO) > 0) {
			return payment.getAmount().setScale(2, RoundingMode.HALF_UP);
		}

		String amountValue = paypalPayload.path("purchase_units")
			.path(0)
			.path("payments")
			.path("captures")
			.path(0)
			.path("amount")
			.path("value")
			.asText("");
		if (amountValue.isBlank()) {
			amountValue = paypalPayload.path("purchase_units")
				.path(0)
				.path("amount")
				.path("value")
				.asText("");
		}

		if (amountValue.isBlank()) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to determine captured PayPal amount");
		}

		try {
			BigDecimal parsedAmount = new BigDecimal(amountValue);
			if (parsedAmount.compareTo(BigDecimal.ZERO) <= 0) {
				throw new ApiException(HttpStatus.BAD_GATEWAY, "Invalid captured PayPal amount");
			}
			return parsedAmount.setScale(2, RoundingMode.HALF_UP);
		} catch (NumberFormatException ex) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "Invalid captured PayPal amount");
		}
	}

	private String fetchAccessToken() {
		String clientId = paypalConfig.getClientId();
		String clientSecret = paypalConfig.getClientSecret();
		if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "PayPal credentials are not configured");
		}

		String encodedCredentials = Base64.getEncoder()
			.encodeToString((clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));
		String body = "grant_type=client_credentials";

		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create(paypalConfig.getBaseUrl() + "/v1/oauth2/token"))
			.timeout(PAYPAL_REQUEST_TIMEOUT)
			.header("Authorization", "Basic " + encodedCredentials)
			.header("Content-Type", "application/x-www-form-urlencoded")
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();

		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 400) {
				throw new ApiException(HttpStatus.BAD_GATEWAY, "Failed to authenticate with PayPal");
			}

			JsonNode bodyJson = objectMapper.readTree(response.body());
			String token = bodyJson.path("access_token").asText("");
			if (token.isBlank()) {
				throw new ApiException(HttpStatus.BAD_GATEWAY, "PayPal access token is missing in response");
			}
			return token;
		} catch (ApiException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new ApiException(HttpStatus.BAD_GATEWAY, "Failed to authenticate with PayPal");
		}
	}

	private JsonNode sendJsonPost(
		String url,
		String accessToken,
		String body,
		HttpStatus failureStatus,
		String failureMessage
	) {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create(url))
			.timeout(PAYPAL_REQUEST_TIMEOUT)
			.header("Authorization", "Bearer " + accessToken)
			.header("Prefer", "return=representation")
			.header("Content-Type", "application/json")
			.POST(HttpRequest.BodyPublishers.ofString(body))
			.build();

		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 400) {
				throw new ApiException(failureStatus, failureMessage);
			}
			return objectMapper.readTree(response.body());
		} catch (ApiException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new ApiException(failureStatus, failureMessage);
		}
	}

	private JsonNode sendJsonGet(String url, String accessToken, HttpStatus failureStatus, String failureMessage) {
		HttpRequest request = HttpRequest.newBuilder()
			.uri(URI.create(url))
			.timeout(PAYPAL_REQUEST_TIMEOUT)
			.header("Authorization", "Bearer " + accessToken)
			.header("Content-Type", "application/json")
			.GET()
			.build();

		try {
			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 400) {
				throw new ApiException(failureStatus, failureMessage);
			}
			return objectMapper.readTree(response.body());
		} catch (ApiException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new ApiException(failureStatus, failureMessage);
		}
	}

	private String findApprovalUrl(JsonNode orderResponse) {
		for (JsonNode link : orderResponse.path("links")) {
			if ("approve".equalsIgnoreCase(link.path("rel").asText(""))) {
				return link.path("href").asText(null);
			}
		}
		return null;
	}

	private String extractCaptureStatus(JsonNode captureResponse) {
		String rootStatus = captureResponse.path("status").asText("");
		if (!rootStatus.isBlank()) {
			return rootStatus;
		}

		JsonNode firstCapture = captureResponse.path("purchase_units")
			.path(0)
			.path("payments")
			.path("captures")
			.path(0);
		return firstCapture.path("status").asText("");
	}

	private Wallet findWalletByEmail(String email) {
		User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
			.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

		return walletRepository.findByUserId(user.getId())
			.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wallet not found"));
	}

	private BigDecimal normalizeAmount(BigDecimal amount) {
		if (amount == null || amount.compareTo(BigDecimal.ONE) < 0) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Top up amount must be at least 1.0");
		}
		return amount.setScale(2, RoundingMode.HALF_UP);
	}

	private String urlEncode(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}
}
