package com.onnet.onnetpc.wallet.paypal;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface PaypalPaymentRepository extends JpaRepository<PaypalPayment, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PaypalPayment> findByTransactionIdAndWalletId(String transactionId, Long walletId);
}
