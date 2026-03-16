package com.onnet.onnetpc.wallet.service;

import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.repository.UserRepository;
import com.onnet.onnetpc.wallet.Wallet;
import com.onnet.onnetpc.wallet.WalletTransaction;
import com.onnet.onnetpc.wallet.dto.TopUpRequest;
import com.onnet.onnetpc.wallet.dto.TopUpResponse;
import com.onnet.onnetpc.wallet.dto.WalletSummaryResponse;
import com.onnet.onnetpc.wallet.dto.WalletTransactionResponse;
import com.onnet.onnetpc.wallet.repository.WalletRepository;
import com.onnet.onnetpc.wallet.repository.WalletTransactionRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public WalletService(
        UserRepository userRepository,
        WalletRepository walletRepository,
        WalletTransactionRepository walletTransactionRepository
    ) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    @Transactional(readOnly = true)
    public WalletSummaryResponse getWalletSummary(String email) {
        Wallet wallet = findWalletByEmail(email);
        return new WalletSummaryResponse(wallet.getId(), wallet.getBalance());
    }

    @Transactional(readOnly = true)
    public List<WalletTransactionResponse> getTransactionHistory(String email) {
        Wallet wallet = findWalletByEmail(email);
        return walletTransactionRepository.findTop100ByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public TopUpResponse createTopUp(String email, TopUpRequest request) {
        Wallet wallet = findWalletByEmail(email);
        BigDecimal amount = request.amount();
        if (amount.compareTo(BigDecimal.ONE) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Top up amount must be at least 1.0");
        }

        return new TopUpResponse(
            "paypal",
            "PENDING",
            "PayPal integration endpoint is reserved. Amount " + amount + " prepared for walletId=" + wallet.getId()
        );
    }

    private WalletTransactionResponse toResponse(WalletTransaction tx) {
        String type = tx.getType() == null ? null : tx.getType().name();
        return new WalletTransactionResponse(tx.getId(), tx.getAmount(), type, tx.getReferenceId(), tx.getNote(), tx.getCreatedAt());
    }

    private Wallet findWalletByEmail(String email) {
        User user = userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        return walletRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Wallet not found"));
    }
}
