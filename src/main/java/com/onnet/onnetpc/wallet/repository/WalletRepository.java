package com.onnet.onnetpc.wallet.repository;

import com.onnet.onnetpc.wallet.Wallet;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserId(Long userId);

    @Query(
        value = """
            SELECT *
            FROM wallets
            WHERE user_id = :userId
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<Wallet> findByUserIdForUpdate(@Param("userId") Long userId);
}
