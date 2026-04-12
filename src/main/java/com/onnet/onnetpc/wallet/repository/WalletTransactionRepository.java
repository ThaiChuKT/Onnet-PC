package com.onnet.onnetpc.wallet.repository;

import com.onnet.onnetpc.wallet.WalletTransactionType;
import com.onnet.onnetpc.wallet.WalletTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findTop100ByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<WalletTransaction> findTop100ByWalletUserIdOrderByCreatedAtDesc(Long userId);

    Page<WalletTransaction> findByTypeOrderByCreatedAtDesc(WalletTransactionType type, Pageable pageable);

    boolean existsByWalletIdAndTypeAndReferenceId(Long walletId, WalletTransactionType type, Long referenceId);
}
