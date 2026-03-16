package com.onnet.onnetpc.wallet.repository;

import com.onnet.onnetpc.wallet.WalletTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findTop100ByWalletIdOrderByCreatedAtDesc(Long walletId);
}
