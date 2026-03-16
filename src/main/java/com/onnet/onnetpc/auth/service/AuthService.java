package com.onnet.onnetpc.auth.service;

import com.onnet.onnetpc.auth.EmailVerificationToken;
import com.onnet.onnetpc.auth.dto.AuthResponse;
import com.onnet.onnetpc.auth.dto.LoginRequest;
import com.onnet.onnetpc.auth.dto.RegisterRequest;
import com.onnet.onnetpc.auth.dto.RegisterResponse;
import com.onnet.onnetpc.auth.repository.EmailVerificationTokenRepository;
import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.common.security.JwtService;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.UserRole;
import com.onnet.onnetpc.users.repository.UserRepository;
import com.onnet.onnetpc.wallet.Wallet;
import com.onnet.onnetpc.wallet.repository.WalletRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        EmailVerificationTokenRepository tokenRepository,
        WalletRepository walletRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(email);
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.user);
        user.setVerified(false);
        user.setActive(true);
        user.setUsername(generateUsernameFromEmail(email));
        user.setUpdatedAt(Instant.now());
        User saved = userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setUser(saved);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setUpdatedAt(Instant.now());
        walletRepository.save(wallet);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(saved);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plusSeconds(24 * 60 * 60));
        tokenRepository.save(token);

        return new RegisterResponse(saved.getId(), token.getToken(), "Account created. Verify email to activate login.");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (Boolean.FALSE.equals(user.getVerified())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account not verified");
        }
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is locked");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, "Bearer", jwtService.extractExpiration(token));
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = tokenRepository.findByToken(tokenValue)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Verification token not found"));

        if (token.getUsedAt() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Verification token already used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Verification token has expired");
        }

        User user = token.getUser();
        user.setVerified(true);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);
    }

    private String generateUsernameFromEmail(String email) {
        String base = email.substring(0, email.indexOf('@')).replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.isBlank()) {
            base = "user";
        }

        String username = base;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + suffix;
            suffix++;
        }
        return username;
    }
}
