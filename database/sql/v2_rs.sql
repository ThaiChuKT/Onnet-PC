-- ============================================================
-- v3.sql
-- PC Rental Platform - Database Schema (Simplified)
-- ============================================================


-- ============================================================
-- MEMBERSHIP TIERS
-- ============================================================

CREATE TABLE `membership_tiers` (
  `id`                         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `tier_name`                  VARCHAR(50) NOT NULL,      -- 'Silver', 'Gold', 'Platinum'
  `tier_level`                 INT NOT NULL,              -- 1, 2, 3
  `monthly_fee`                DECIMAL(10,2) NOT NULL,
  `discount_percentage`        DECIMAL(5,2) DEFAULT 0,   -- % giảm giá thuê máy
  `storage_limit_gb`           INT,                       -- NULL = unlimited
  `free_hours_per_month`       INT DEFAULT 0,
  `rollover_hours_limit`       INT DEFAULT 0,             -- giờ tối đa chuyển sang tháng sau
  `advance_booking_days`       INT DEFAULT 0,             -- được đặt trước bao nhiêu ngày
  `queue_priority`             INT DEFAULT 99,            -- số càng nhỏ = ưu tiên càng cao
  `can_access_exclusive_specs` BOOLEAN DEFAULT FALSE,     -- chỉ Platinum mới TRUE
  `support_level`              VARCHAR(50),               -- 'ticket', 'live_chat', 'priority_24_7'
  `is_active`                  BOOLEAN DEFAULT TRUE,
  `created_at`                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE `users` (
  `id`            BIGINT PRIMARY KEY AUTO_INCREMENT,
  `username`      VARCHAR(100) NOT NULL UNIQUE,
  `full_name`     VARCHAR(150),
  `email`         VARCHAR(255) NOT NULL UNIQUE,
  `phone`         VARCHAR(20),
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar`        VARCHAR(255),
  `role`          VARCHAR(50) DEFAULT 'user',             -- 'admin', 'user'
  `tier_id`       BIGINT,                                 -- cached tier hiện tại để query nhanh
  `is_verified`   BOOLEAN DEFAULT FALSE,
  `is_active`     BOOLEAN DEFAULT TRUE,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP,
  `deleted_at`    TIMESTAMP                               -- soft delete
);

-- Membership của user: lưu lịch sử và trạng thái đăng ký tier
CREATE TABLE `user_memberships` (
  `id`         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id`    BIGINT NOT NULL,
  `tier_id`    BIGINT NOT NULL,
  `start_date` TIMESTAMP NOT NULL,
  `end_date`   TIMESTAMP NOT NULL,
  `status`     VARCHAR(50) DEFAULT 'active',              -- 'active', 'expired', 'cancelled'
  `auto_renew` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Token xác minh email khi đăng ký tài khoản (G3)
CREATE TABLE `email_verification_tokens` (
  `id`         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id`    BIGINT NOT NULL,
  `token`      VARCHAR(255) NOT NULL UNIQUE,
  `expires_at` TIMESTAMP NOT NULL,
  `used_at`    TIMESTAMP,                            -- NULL nếu chưa dùng
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- PC SPECS & PCS
-- ============================================================

CREATE TABLE `pc_specs` (
  `id`             BIGINT PRIMARY KEY AUTO_INCREMENT,
  `spec_name`      VARCHAR(100) NOT NULL,
  `cpu`            VARCHAR(100),
  `gpu`            VARCHAR(100),
  `ram`            INT,                                   -- GB
  `storage`        INT,                                   -- GB
  `os`             VARCHAR(100),                         -- 'Windows 11', 'Ubuntu 22.04'
  `price_per_hour` DECIMAL(10,2) NOT NULL,
  `description`    TEXT,
  `is_exclusive`   BOOLEAN DEFAULT FALSE,                -- TRUE = chỉ Platinum mới thuê được
  `is_available`   BOOLEAN DEFAULT TRUE,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `pcs` (
  `id`         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `spec_id`    BIGINT NOT NULL,
  `status`     VARCHAR(50) DEFAULT 'available',          -- 'available', 'in_use', 'maintenance'
  `location`   VARCHAR(255),
  `updated_at` TIMESTAMP,
  `deleted_at` TIMESTAMP                                 -- soft delete
);


-- ============================================================
-- SUBSCRIPTION PLANS (Gói tháng/năm)
-- ============================================================

CREATE TABLE `subscription_plans` (
  `id`                BIGINT PRIMARY KEY AUTO_INCREMENT,
  `plan_name`         VARCHAR(100) NOT NULL,
  `spec_id`           BIGINT NOT NULL,
  `duration_days`     INT NOT NULL,                      -- 30 = tháng, 365 = năm
  `price`             DECIMAL(10,2) NOT NULL,
  `max_hours_per_day` INT,                               -- NULL = không giới hạn
  `is_active`         BOOLEAN DEFAULT TRUE,
  `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_subscriptions` (
  `id`         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id`    BIGINT NOT NULL,
  `plan_id`    BIGINT NOT NULL,
  `pc_id`      BIGINT,                                   -- máy được gán cố định nếu là Platinum
  `start_date` TIMESTAMP NOT NULL,
  `end_date`   TIMESTAMP NOT NULL,
  `status`     VARCHAR(50) DEFAULT 'active',             -- 'active', 'expired', 'cancelled'
  `auto_renew` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- BOOKINGS & SESSIONS
-- ============================================================

-- Booking là đơn đặt máy, có thể là thuê theo giờ hoặc dùng gói subscription
CREATE TABLE `bookings` (
  `id`             BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id`        BIGINT NOT NULL,
  `spec_id`        BIGINT NOT NULL,
  `pc_id`          BIGINT,                               -- được assign sau khi xác nhận
  `booking_type`   VARCHAR(50) NOT NULL,                 -- 'hourly', 'subscription'
  `total_hours`    INT,                                  -- NULL nếu là subscription
  `start_time`     TIMESTAMP NOT NULL,
  `end_time`       TIMESTAMP,
  -- total_price lưu lại để tránh sai lệch nếu price_per_hour thay đổi sau này
  -- và để tránh JOIN lại pc_specs khi cần hiển thị lịch sử
  `total_price`    DECIMAL(10,2),                        -- NULL nếu dùng gói subscription đã trả trước
  `status`         VARCHAR(50) DEFAULT 'pending',        -- 'pending', 'paid', 'cancelled', 'completed'
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP
);

CREATE TABLE `sessions` (
  `id`         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `booking_id` BIGINT NOT NULL,
  `user_id`    BIGINT NOT NULL,
  `pc_id`      BIGINT NOT NULL,
  `start_time` TIMESTAMP NOT NULL,
  `end_time`   TIMESTAMP,
  `total_cost` DECIMAL(10,2),
  `status`     VARCHAR(50) DEFAULT 'active'              -- 'active', 'ended', 'interrupted'
);

-- Đánh giá máy của user sau khi kết thúc booking (status = 'completed')
-- Mỗi booking chỉ được review 1 lần (unique constraint trên booking_id)
CREATE TABLE `reviews` (
  `id`          BIGINT PRIMARY KEY AUTO_INCREMENT,
  `booking_id`  BIGINT NOT NULL UNIQUE,              -- 1 booking = 1 review tối đa
  `user_id`     BIGINT NOT NULL,
  `pc_id`       BIGINT NOT NULL,
  `rating`      TINYINT NOT NULL,                    -- 1–5 sao
  `comment`     TEXT,
  `status`      VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'approved', 'rejected'
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lưu trữ file của user sau mỗi session (giới hạn theo tier)
CREATE TABLE `session_files` (
  `id`         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `session_id` BIGINT NOT NULL,
  `file_name`  VARCHAR(255),
  `file_path`  VARCHAR(500),
  `file_size`  BIGINT,                                   -- bytes
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hàng chờ khi tất cả máy đang bận, ưu tiên theo tier
CREATE TABLE `session_queue` (
  `id`             BIGINT PRIMARY KEY AUTO_INCREMENT,
  `booking_id`     BIGINT NOT NULL,
  `user_id`        BIGINT NOT NULL,
  `spec_id`        BIGINT NOT NULL,
  `queue_position` INT NOT NULL,
  `status`         VARCHAR(50) DEFAULT 'waiting',        -- 'waiting', 'processing', 'cancelled'
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- PAYMENTS & WALLETS
-- ============================================================

-- Wallet là ví nạp tiền trước: user nạp 1 lần qua cổng thanh toán,
-- các lần thuê sau hệ thống chỉ cần trừ số dư ví — nhanh hơn và không
-- cần redirect sang cổng thanh toán mỗi lần
CREATE TABLE `wallets` (
  `id`         BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id`    BIGINT NOT NULL UNIQUE,
  `balance`    DECIMAL(10,2) DEFAULT 0,
  `updated_at` TIMESTAMP
);

-- Mỗi lần nạp tiền vào ví, thanh toán booking, hoặc hoàn tiền đều ghi vào đây
CREATE TABLE `wallet_transactions` (
  `id`           BIGINT PRIMARY KEY AUTO_INCREMENT,
  `wallet_id`    BIGINT NOT NULL,
  `amount`       DECIMAL(10,2) NOT NULL,                 -- dương = cộng vào, âm = trừ đi
  `type`         VARCHAR(50) NOT NULL,                   -- 'top_up', 'deduct', 'refund'
  `reference_id` BIGINT,                                 -- booking_id nếu là deduct/refund
  `note`         VARCHAR(255),
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_wallet_tx_wallet_type_ref` (`wallet_id`, `type`, `reference_id`),
  KEY `idx_wallet_tx_wallet_created` (`wallet_id`, `created_at`)
);

-- Lịch sử giao dịch với cổng thanh toán bên ngoài (chỉ dùng khi nạp ví)
CREATE TABLE `payments` (
  `id`             BIGINT PRIMARY KEY AUTO_INCREMENT,
  `wallet_id`      BIGINT NOT NULL,                      -- nạp vào ví nào
  `amount`         DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(100),                         -- 'vnpay', 'momo', 'stripe'
  `payment_status` VARCHAR(50) DEFAULT 'pending',        -- 'pending', 'success', 'failed'
  `transaction_id` VARCHAR(255),                         -- mã giao dịch từ cổng thanh toán
  -- Refund chỉ áp dụng cho gói từ tháng trở lên (booking_type = 'subscription')
  -- Thuê theo giờ/tuần KHÔNG hoàn tiền
  `is_refundable`  BOOLEAN DEFAULT FALSE,
  `refunded_at`    TIMESTAMP,                            -- NULL nếu chưa hoàn tiền
  `paid_at`        TIMESTAMP,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- AI RECOMMENDATIONS
-- ============================================================

CREATE TABLE `ai_recommendations` (
  `id`                  BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id`             BIGINT NOT NULL,
  `recommended_spec_id` BIGINT NOT NULL,
  `reason`              TEXT,
  `created_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- FOREIGN KEYS
-- ============================================================

-- users
ALTER TABLE `users`
  ADD FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`);

-- user_memberships
ALTER TABLE `user_memberships`
  ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`);

-- pcs
ALTER TABLE `pcs`
  ADD FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);

-- subscription_plans
ALTER TABLE `subscription_plans`
  ADD FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);

-- user_subscriptions
ALTER TABLE `user_subscriptions`
  ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD FOREIGN KEY (`pc_id`)   REFERENCES `pcs` (`id`);

-- bookings
ALTER TABLE `bookings`
  ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`),
  ADD FOREIGN KEY (`pc_id`)   REFERENCES `pcs` (`id`);

-- sessions
ALTER TABLE `sessions`
  ADD FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`pc_id`)      REFERENCES `pcs` (`id`);

-- session_files
ALTER TABLE `session_files`
  ADD FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`);

-- session_queue
ALTER TABLE `session_queue`
  ADD FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`spec_id`)    REFERENCES `pc_specs` (`id`);

-- wallets
ALTER TABLE `wallets`
  ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

-- wallet_transactions
ALTER TABLE `wallet_transactions`
  ADD FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

-- payments
ALTER TABLE `payments`
  ADD FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

-- ai_recommendations
ALTER TABLE `ai_recommendations`
  ADD FOREIGN KEY (`user_id`)             REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`recommended_spec_id`) REFERENCES `pc_specs` (`id`);

-- email_verification_tokens
ALTER TABLE `email_verification_tokens`
  ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

-- reviews
ALTER TABLE `reviews`
  ADD FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`),
  ADD FOREIGN KEY (`pc_id`)      REFERENCES `pcs` (`id`);
