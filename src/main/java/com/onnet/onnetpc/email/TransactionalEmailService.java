package com.onnet.onnetpc.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class TransactionalEmailService {

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final String provider;
    private final String smtpUsername;
    private final String defaultFrom;
    private final String resendApiKey;
    private final String resendFrom;
    private final String resendBaseUrl;

    public TransactionalEmailService(
        JavaMailSender mailSender,
        @Value("${app.email.provider:smtp}") String provider,
        @Value("${spring.mail.username:}") String smtpUsername,
        @Value("${app.email.verification.from:no-reply@onnetpc.local}") String defaultFrom,
        @Value("${app.email.resend.api-key:}") String resendApiKey,
        @Value("${app.email.resend.from:}") String resendFrom,
        @Value("${app.email.resend.base-url:https://api.resend.com}") String resendBaseUrl
    ) {
        this.mailSender = mailSender;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        this.provider = normalize(provider);
        this.smtpUsername = trim(smtpUsername);
        this.defaultFrom = resolveMailFrom(defaultFrom, this.smtpUsername);
        this.resendApiKey = trim(resendApiKey);
        this.resendFrom = trim(resendFrom);
        this.resendBaseUrl = trim(resendBaseUrl).replaceAll("/+$", "");
    }

    public EmailSendResult sendText(String to, String subject, String text) {
        String activeProvider = provider.isBlank() ? "smtp" : provider;
        try {
            if ("resend".equals(activeProvider)) {
                sendViaResend(to, subject, text);
            } else {
                sendViaSmtp(to, subject, text);
            }
            return EmailSendResult.sent(activeProvider);
        } catch (Exception ex) {
            return EmailSendResult.failed(activeProvider, ex);
        }
    }

    public String provider() {
        return provider.isBlank() ? "smtp" : provider;
    }

    public String fromAddress() {
        if ("resend".equals(provider()) && !resendFrom.isBlank()) {
            return resendFrom;
        }
        return defaultFrom;
    }

    private void sendViaSmtp(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(defaultFrom);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    private void sendViaResend(String to, String subject, String text) throws Exception {
        if (resendApiKey.isBlank()) {
            throw new IllegalStateException("Resend API key is not configured");
        }
        String from = resendFrom.isBlank() ? defaultFrom : resendFrom;
        if (from.isBlank() || !from.contains("@")) {
            throw new IllegalStateException("Resend sender address is not configured");
        }

        String body = objectMapper.writeValueAsString(Map.of(
            "from", from,
            "to", List.of(to),
            "subject", subject,
            "text", text
        ));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(resendBaseUrl + "/emails"))
            .timeout(Duration.ofSeconds(20))
            .header("Authorization", "Bearer " + resendApiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        int status = response.statusCode();
        if (status < 200 || status >= 300) {
            throw new IllegalStateException("Resend HTTP " + status + ": " + truncate(response.body()));
        }
    }

    private String resolveMailFrom(String configuredFrom, String mailUsername) {
        String username = trim(mailUsername);
        String from = trim(configuredFrom);
        if (username.toLowerCase(Locale.ROOT).endsWith("@gmail.com")) {
            return username;
        }
        return from.isBlank() ? username : from;
    }

    private String normalize(String value) {
        return trim(value).toLowerCase(Locale.ROOT);
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private String truncate(String value) {
        if (value == null) {
            return "";
        }
        return value.length() <= 500 ? value : value.substring(0, 500);
    }
}
