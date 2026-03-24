-- Patch: make wallet_transactions idempotent for concurrent PayPal webhook/API finalize
-- Run this once on the CURRENT database before/after deploying service changes.

-- 1) Remove duplicated top_up rows, keep the earliest row in each duplicate group.
DELETE wt1
FROM wallet_transactions wt1
JOIN wallet_transactions wt2
  ON wt1.wallet_id = wt2.wallet_id
 AND wt1.type = wt2.type
 AND wt1.reference_id = wt2.reference_id
 AND wt1.id > wt2.id
WHERE wt1.type = 'top_up'
  AND wt1.reference_id IS NOT NULL;

-- 2) Add unique key to enforce idempotency at DB level.
ALTER TABLE wallet_transactions
  ADD CONSTRAINT uq_wallet_tx_wallet_type_ref
  UNIQUE (wallet_id, type, reference_id);

-- 3) Add index for wallet history queries.
ALTER TABLE wallet_transactions
  ADD INDEX idx_wallet_tx_wallet_created (wallet_id, created_at);
