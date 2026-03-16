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
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaypalService {

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
		this.httpClient = HttpClient.newHttpClient();
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
		PaypalPayment payment = paypalPaymentRepository.findByTransactionIdAndWalletId(orderId, wallet.getId())
			.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PayPal order not found for this wallet"));

		if (payment.getPaymentStatus() == PaypalPaymentStatus.success) {
			return new PaypalCaptureResponse(orderId, "COMPLETED", "Order already captured", wallet.getBalance());
		}

		String accessToken = fetchAccessToken();
		JsonNode response = sendJsonPost(
			paypalConfig.getBaseUrl() + "/v2/checkout/orders/" + urlEncode(orderId) + "/capture",
			accessToken,
			"{}",
			HttpStatus.BAD_GATEWAY,
			"Failed to capture PayPal order"
		);

		String captureStatus = extractCaptureStatus(response);
		if (!"COMPLETED".equalsIgnoreCase(captureStatus)) {
			payment.setPaymentStatus(PaypalPaymentStatus.failed);
			paypalPaymentRepository.save(payment);
			throw new ApiException(HttpStatus.BAD_REQUEST, "PayPal payment is not completed yet");
		}

		wallet.setBalance(wallet.getBalance().add(payment.getAmount()));
		wallet.setUpdatedAt(Instant.now());
		walletRepository.save(wallet);

		WalletTransaction walletTransaction = new WalletTransaction();
		walletTransaction.setWallet(wallet);
		walletTransaction.setAmount(payment.getAmount());
		walletTransaction.setType(WalletTransactionType.top_up);
		walletTransaction.setReferenceId(payment.getId());
		walletTransaction.setNote("PayPal top-up order " + orderId);
		walletTransactionRepository.save(walletTransaction);

		payment.setPaymentStatus(PaypalPaymentStatus.success);
		payment.setPaidAt(Instant.now());
		paypalPaymentRepository.save(payment);

		return new PaypalCaptureResponse(orderId, "COMPLETED", "Wallet topped up successfully", wallet.getBalance());
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
			.header("Authorization", "Bearer " + accessToken)
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
