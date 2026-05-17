package com.onnet.onnetpc.auth.service;

import com.onnet.onnetpc.auth.EmailVerificationToken;
import com.onnet.onnetpc.auth.PasswordResetToken;
import com.onnet.onnetpc.auth.PasswordPolicy;
import com.onnet.onnetpc.auth.dto.AuthResponse;
import com.onnet.onnetpc.auth.dto.LoginRequest;
import com.onnet.onnetpc.auth.dto.RegisterRequest;
import com.onnet.onnetpc.auth.dto.RegisterResponse;
import com.onnet.onnetpc.auth.dto.VerifyEmailCodeRequest;
import com.onnet.onnetpc.auth.dto.ForgotPasswordRequest;
import com.onnet.onnetpc.auth.dto.ResetPasswordRequest;
import com.onnet.onnetpc.auth.repository.EmailVerificationTokenRepository;
import com.onnet.onnetpc.auth.repository.PasswordResetTokenRepository;
import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.common.security.JwtService;
import com.onnet.onnetpc.email.EmailSendResult;
import com.onnet.onnetpc.email.TransactionalEmailService;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.UserRole;
import com.onnet.onnetpc.users.repository.UserRepository;
import com.onnet.onnetpc.wallet.Wallet;
import com.onnet.onnetpc.wallet.repository.WalletRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.security.SecureRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TransactionalEmailService emailService;
    private final long verificationCodeExpiryMinutes;

    public AuthService(
        UserRepository userRepository,
        EmailVerificationTokenRepository tokenRepository,
        PasswordResetTokenRepository resetTokenRepository,
        WalletRepository walletRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        TransactionalEmailService emailService,
        @Value("${app.email.verification.expiry-minutes:15}") long verificationCodeExpiryMinutes
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.verificationCodeExpiryMinutes = verificationCodeExpiryMinutes;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase(Locale.ROOT);
        Optional<User> existingUser = userRepository.findByEmail(email);

        User targetUser;
        if (existingUser.isPresent()) {
            targetUser = existingUser.get();
            boolean restoringDeletedAccount = targetUser.getDeletedAt() != null;
            if (!restoringDeletedAccount && Boolean.TRUE.equals(targetUser.getVerified())) {
                throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
            }
            targetUser.setFullName(request.fullName());
            targetUser.setPhone(request.phone());
            targetUser.setPasswordHash(passwordEncoder.encode(request.password()));
            targetUser.setActive(true);
            targetUser.setDeletedAt(null);
            targetUser.setVerified(false);
            targetUser.setUpdatedAt(Instant.now());
            targetUser = userRepository.save(targetUser);
            ensureWalletExists(targetUser);
        } else {
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
            targetUser = userRepository.save(user);

            ensureWalletExists(targetUser);
        }

        tokenRepository.deleteByUserId(targetUser.getId());
        String verificationCode = generateVerificationCode();

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(targetUser);
        token.setToken(verificationCode);
        token.setExpiresAt(Instant.now().plusSeconds(verificationCodeExpiryMinutes * 60));
        tokenRepository.save(token);

        boolean emailSent = sendVerificationCodeEmail(email, verificationCode);

        String registerMessage = emailSent
            ? "Verification code sent to your email. Enter the code to complete registration."
            : "Account created, but we could not send the verification email right now. Please try again later.";

        return new RegisterResponse(
            targetUser.getId(),
            email,
            registerMessage
        );
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String email = request.email().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return; // do not reveal existence

        tokenRepository.deleteByUserId(user.getId());
        String code = generateVerificationCode();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(code);
        token.setExpiresAt(Instant.now().plusSeconds(verificationCodeExpiryMinutes * 60));
        resetTokenRepository.deleteByUserId(user.getId());
        resetTokenRepository.save(token);

        sendVerificationCodeEmail(email, code);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.email().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password confirmation does not match");
        }


        PasswordResetToken token = resetTokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Reset code not found"));

        if (!token.getToken().equals(request.code())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid reset code");
        }

        if (token.getUsedAt() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Reset token already used");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Reset token has expired");
        }

        PasswordPolicy.validate(request.newPassword());

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        resetTokenRepository.save(token);
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
    public void verifyEmail(VerifyEmailCodeRequest request) {
        String email = request.email().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));

        if (Boolean.TRUE.equals(user.getVerified())) {
            return;
        }

        EmailVerificationToken token = tokenRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Verification code not found"));

        if (!token.getToken().equals(request.code())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }

        if (token.getUsedAt() != null) {
            // Idempotent verify: duplicate requests should still be treated as success.
            if (!Boolean.TRUE.equals(user.getVerified())) {
                user.setVerified(true);
                user.setUpdatedAt(Instant.now());
                userRepository.save(user);
            }
            if (Boolean.TRUE.equals(user.getVerified())) {
                return;
            }
            throw new ApiException(HttpStatus.BAD_REQUEST, "Verification token already used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Verification token has expired");
        }

        user.setVerified(true);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);
    }

    private String generateVerificationCode() {
        int code = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(code);
    }

    private void ensureWalletExists(User user) {
        if (walletRepository.findByUserId(user.getId()).isPresent()) {
            return;
        }
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setUpdatedAt(Instant.now());
        walletRepository.save(wallet);
    }

    private boolean sendVerificationCodeEmail(String email, String code) {
        EmailSendResult result = emailService.sendText(
            email,
            "Your OnnetPC verification code",
            "Your OnnetPC verification code is: " + code + "\n\n"
                + "This code expires in " + verificationCodeExpiryMinutes + " minutes."
        );
        if (!result.sent()) {
            LOGGER.error(
                "Failed to send verification email to {} via {}. from={}, rootType={}, rootMessage={}",
                email,
                result.provider(),
                emailService.fromAddress(),
                result.errorType(),
                result.errorMessage()
            );
        }
        return result.sent();
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
