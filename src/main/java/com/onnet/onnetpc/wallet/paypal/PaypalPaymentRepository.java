package com.onnet.onnetpc.wallet.paypal;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaypalPaymentRepository extends JpaRepository<PaypalPayment, Long> {

    @Query(
        value = """
            SELECT *
            FROM payments
            WHERE transaction_id = :transactionId
              AND wallet_id = :walletId
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<PaypalPayment> findByTransactionIdAndWalletIdForUpdate(
        @Param("transactionId") String transactionId,
        @Param("walletId") Long walletId
    );

    @Query(
        value = """
            SELECT *
            FROM payments
            WHERE transaction_id = :transactionId
            FOR UPDATE
            """,
        nativeQuery = true
    )
    Optional<PaypalPayment> findByTransactionIdForUpdate(@Param("transactionId") String transactionId);

    List<PaypalPayment> findTop10ByWalletIdAndPaymentStatusOrderByCreatedAtDesc(Long walletId, PaypalPaymentStatus paymentStatus);
}
