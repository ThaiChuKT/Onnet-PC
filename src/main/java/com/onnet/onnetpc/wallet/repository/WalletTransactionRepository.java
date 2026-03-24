package com.onnet.onnetpc.wallet.repository;

import com.onnet.onnetpc.wallet.WalletTransactionType;
import com.onnet.onnetpc.wallet.WalletTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findTop100ByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<WalletTransaction> findTop100ByWalletUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByWalletIdAndTypeAndReferenceId(Long walletId, WalletTransactionType type, Long referenceId);
}
