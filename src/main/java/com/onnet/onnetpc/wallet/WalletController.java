package com.onnet.onnetpc.wallet;

import com.onnet.onnetpc.common.response.ApiResponse;
import com.onnet.onnetpc.wallet.dto.TopUpRequest;
import com.onnet.onnetpc.wallet.dto.TopUpResponse;
import com.onnet.onnetpc.wallet.dto.WalletSummaryResponse;
import com.onnet.onnetpc.wallet.dto.WalletTransactionResponse;
import com.onnet.onnetpc.wallet.service.WalletService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    public ApiResponse<WalletSummaryResponse> getWallet(Authentication authentication) {
        return ApiResponse.success(walletService.getWalletSummary(authentication.getName()));
    }

    @GetMapping("/transactions")
    public ApiResponse<List<WalletTransactionResponse>> getTransactions(Authentication authentication) {
        return ApiResponse.success(walletService.getTransactionHistory(authentication.getName()));
    }

    @PostMapping("/top-up")
    public ApiResponse<TopUpResponse> topUp(Authentication authentication, @Valid @RequestBody TopUpRequest request) {
        return ApiResponse.success(walletService.createTopUp(authentication.getName(), request));
    }
}
