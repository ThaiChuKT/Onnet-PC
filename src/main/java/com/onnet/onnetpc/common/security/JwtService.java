package com.onnet.onnetpc.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final SecretKey signingKey;
    private final long expirationMinutes;

    public JwtService(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.access-token-expiration-minutes}") long expirationMinutes
    ) {
        if (secret == null || secret.isBlank()) {
            log.error("JWT secret is missing or empty. Set environment variable APP_JWT_SECRET.");
            throw new IllegalStateException("app.jwt.secret must be configured and non-empty");
        }

        try {
            byte[] keyBytes;
            try {
                keyBytes = MessageDigest.getInstance("SHA-256")
                    .digest(secret.getBytes(StandardCharsets.UTF_8));
            } catch (NoSuchAlgorithmException ex) {
                log.error("SHA-256 algorithm not available to derive JWT key", ex);
                throw new IllegalStateException("Unable to derive JWT signing key (SHA-256 not available)", ex);
            }

            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
            this.expirationMinutes = expirationMinutes;
        } catch (Exception ex) {
            log.error("Failed to initialize JwtService: {}", ex.getMessage(), ex);
            throw new IllegalStateException("Failed to initialize JwtService: " + ex.getMessage(), ex);
        }
    }

    public String generateToken(String subject) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expirationMinutes * 60);
        return Jwts.builder()
            .subject(subject)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(signingKey)
            .compact();
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public Instant extractExpiration(String token) {
        return parseClaims(token).getExpiration().toInstant();
    }

    public boolean isTokenValid(String token) {
        try {
            return extractExpiration(token).isAfter(Instant.now());
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
