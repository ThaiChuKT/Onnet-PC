SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ========================================================
-- 1. TẠO CẤU TRÚC BẢNG (DATABASE SCHEMA)
-- ========================================================

CREATE TABLE `membership_tiers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tier_name` varchar(255) NOT NULL,
  `tier_level` int(11) NOT NULL,
  `monthly_fee` decimal(38,2) NOT NULL,
  `discount_percentage` decimal(38,2) DEFAULT NULL,
  `storage_limit_gb` int(11) DEFAULT NULL,
  `free_hours_per_month` int(11) DEFAULT 0,
  `rollover_hours_limit` int(11) DEFAULT 0,
  `advance_booking_days` int(11) DEFAULT 0,
  `queue_priority` int(11) DEFAULT 99,
  `can_access_exclusive_specs` tinyint(1) DEFAULT 0,
  `support_level` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pc_specs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `spec_name` varchar(255) DEFAULT NULL,
  `cpu` varchar(255) DEFAULT NULL,
  `gpu` varchar(255) DEFAULT NULL,
  `ram` int(11) DEFAULT NULL,
  `storage` int(11) DEFAULT NULL,
  `os` varchar(255) DEFAULT NULL,
  `price_per_hour` decimal(38,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_exclusive` tinyint(1) DEFAULT 0,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `membership_tier_spec_mappings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tier_id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_membership_tier_spec` (`tier_id`,`spec_id`),
  UNIQUE KEY `uq_membership_spec_single_tier` (`spec_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pcs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `spec_id` bigint(20) NOT NULL,
  `status` varchar(50) DEFAULT 'available',
  `location` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `spec_id` (`spec_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `tier_id` bigint(20) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `tier_id` (`tier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `wallets` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `balance` decimal(38,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subscription_plans` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(255) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `max_hours_per_day` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `spec_id` (`spec_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bookings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `plan_id` bigint(20) DEFAULT NULL,
  `pc_id` bigint(20) DEFAULT NULL,
  `booking_type` varchar(50) NOT NULL,
  `total_hours` int(11) DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `spec_id` (`spec_id`),
  KEY `pc_id` (`pc_id`),
  KEY `idx_bookings_plan_id` (`plan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `pc_id` bigint(20) NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `total_cost` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `user_id` (`user_id`),
  KEY `pc_id` (`pc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `wallet_id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `wallet_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `is_refundable` tinyint(1) DEFAULT 0,
  `refunded_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paid_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `wallet_id` (`wallet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sunshine_hosts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `host_address` varchar(255) NOT NULL,
  `host_port` int(11) NOT NULL DEFAULT 47989,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `notes` varchar(500) DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `pc_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `moonlight_command_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `host_id` bigint(20) NOT NULL,
  `requested_by` bigint(20) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `command_text` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `output_text` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `email_verification_tokens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ai_recommendations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `recommended_spec_id` bigint(20) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `pc_id` bigint(20) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `session_files` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `session_id` bigint(20) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `session_queue` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `tier_id` bigint(20) DEFAULT NULL,
  `queue_position` int(11) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_memberships` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `tier_id` bigint(20) NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` varchar(50) DEFAULT 'active',
  `auto_renew` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user_subscriptions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `plan_id` bigint(20) NOT NULL,
  `pc_id` bigint(20) DEFAULT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` varchar(50) DEFAULT 'active',
  `auto_renew` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ========================================================
-- 2. SEED DATA (DỮ LIỆU MẪU KHỞI TẠO)
-- ========================================================

-- 2.1. Seed Membership Tiers
INSERT INTO `membership_tiers` (`id`, `tier_name`, `tier_level`, `monthly_fee`, `discount_percentage`, `queue_priority`, `can_access_exclusive_specs`, `support_level`) VALUES
(1, 'Basic', 1, 15.00, 0.00, 30, 0, 'standard'),
(2, 'Pro', 2, 35.00, 5.00, 20, 0, 'priority'),
(3, 'Ultra', 3, 65.00, 10.00, 10, 1, 'vip');

-- 2.2. Seed PC Specs (Mỗi gói có 2 cấu hình đại diện cho Intel và Ryzen)
INSERT INTO `pc_specs` (`id`, `spec_name`, `cpu`, `gpu`, `ram`, `storage`, `os`, `price_per_hour`, `description`, `is_exclusive`) VALUES
-- Basic Tier Specs
(1, 'Basic Intel Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, 'Phù hợp gaming Esports 1080p mượt mà', 0),
(2, 'Basic AMD Ryzen Core', 'AMD Ryzen 5 5600X', 'AMD Radeon RX 6600', 16, 512, 'Windows 11', 2.40, 'Hiệu năng gaming thuần túy tối ưu chi phí', 0),
-- Pro Tier Specs
(3, 'Pro Intel Gaming', 'Intel Core i7-13700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 5.00, 'Chiến mượt AAA Max Setting và Livestream', 0),
(4, 'Pro Ryzen Performance', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 1024, 'Windows 11', 5.50, 'Đồ họa đỉnh cao, xử lý đa nhiệm mượt mà', 0),
-- Ultra Tier Specs
(5, 'Ultra Intel Ultimate', 'Intel Core i9-14900K', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.00, 'Siêu quái vật Workstation chuyên render và 4K Gaming', 1),
(6, 'Ultra AMD Beast', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.50, 'Cực đỉnh xử lý thuật toán AI và đồ họa nặng', 1);

-- 2.3. Mapped Specs to Membership Tiers
INSERT INTO `membership_tier_spec_mappings` (`tier_id`, `spec_id`) VALUES
(1, 1), (1, 2), -- Basic Tier sở hữu máy 1, 2
(2, 3), (2, 4), -- Pro Tier sở hữu máy 3, 4
(3, 5), (3, 6); -- Ultra Tier sở hữu máy 5, 6

-- 2.4. Seed 30 PCs (Phân bổ đều: mỗi plan/tier quản lý đúng 10 máy)
INSERT INTO `pcs` (`id`, `spec_id`, `status`, `location`) VALUES
-- 10 Máy thuộc Gói Basic (Mix cấu hình 1 và 2)
(1, 1, 'available', 'Zone Basic - Seat 01'),
(2, 2, 'available', 'Zone Basic - Seat 02'),
(3, 1, 'available', 'Zone Basic - Seat 03'),
(4, 2, 'available', 'Zone Basic - Seat 04'),
(5, 1, 'available', 'Zone Basic - Seat 05'),
(6, 2, 'available', 'Zone Basic - Seat 06'),
(7, 1, 'available', 'Zone Basic - Seat 07'),
(8, 2, 'available', 'Zone Basic - Seat 08'),
(9, 1, 'available', 'Zone Basic - Seat 09'),
(10, 2, 'available', 'Zone Basic - Seat 10'),
-- 10 Máy thuộc Gói Pro (Mix cấu hình 3 và 4)
(11, 3, 'available', 'Zone Pro - Seat 01'),
(12, 4, 'available', 'Zone Pro - Seat 02'),
(13, 3, 'available', 'Zone Pro - Seat 03'),
(14, 4, 'available', 'Zone Pro - Seat 04'),
(15, 3, 'available', 'Zone Pro - Seat 05'),
(16, 4, 'available', 'Zone Pro - Seat 06'),
(17, 3, 'available', 'Zone Pro - Seat 07'),
(18, 4, 'available', 'Zone Pro - Seat 08'),
(19, 3, 'available', 'Zone Pro - Seat 09'),
(20, 4, 'available', 'Zone Pro - Seat 10'),
-- 10 Máy thuộc Gói Ultra (Mix cấu hình 5 và 6)
(21, 5, 'available', 'Zone Ultra - Seat 01'),
(22, 6, 'available', 'Zone Ultra - Seat 02'),
(23, 5, 'available', 'Zone Ultra - Seat 03'),
(24, 6, 'available', 'Zone Ultra - Seat 04'),
(25, 5, 'available', 'Zone Ultra - Seat 05'),
(26, 6, 'available', 'Zone Ultra - Seat 06'),
(27, 5, 'available', 'Zone Ultra - Seat 07'),
(28, 6, 'available', 'Zone Ultra - Seat 08'),
(29, 5, 'available', 'Zone Ultra - Seat 09'),
(30, 6, 'available', 'Zone Ultra - Seat 10');

-- 2.5. Seed Subscription Plans theo tuần/tháng cho các cấu hình máy
INSERT INTO `subscription_plans` (`id`, `plan_name`, `spec_id`, `duration_days`, `price`) VALUES
(1, 'Basic Intel - Weekly', 1, 7, 15.00),
(2, 'Basic AMD - Weekly', 2, 7, 14.00),
(3, 'Pro Intel - Monthly', 3, 30, 50.00),
(4, 'Pro AMD - Monthly', 4, 30, 55.00),
(5, 'Ultra Intel - Monthly', 5, 30, 100.00),
(6, 'Ultra AMD - Monthly', 6, 30, 105.00),
(7, 'Basic Intel - Monthly', 1, 30, 60.00),
(8, 'Basic AMD - Monthly', 2, 30, 56.00),
(9, 'Basic Intel - Yearly', 1, 365, 600.00),
(10, 'Basic AMD - Yearly', 2, 365, 560.00),
(11, 'Pro Intel - Weekly', 3, 7, 15.00),
(12, 'Pro AMD - Weekly', 4, 7, 16.50),
(13, 'Pro Intel - Yearly', 3, 365, 500.00),
(14, 'Pro AMD - Yearly', 4, 365, 550.00),
(15, 'Ultra Intel - Weekly', 5, 7, 30.00),
(16, 'Ultra AMD - Weekly', 6, 7, 31.50),
(17, 'Ultra Intel - Yearly', 5, 365, 1000.00),
(18, 'Ultra AMD - Yearly', 6, 365, 1050.00);

-- 2.6. Seed 15 Users (Gồm 1 Admin và 14 thành viên trải đều các gói hội viên)
INSERT INTO `users` (`id`, `username`, `full_name`, `email`, `phone`, `password_hash`, `role`, `tier_id`, `is_verified`) VALUES
(1, 'admin_cyber', 'Nguyen Van Admin', 'admin@onnetpc.com', '0911223344', '$2a$10$mhtsJJQPNjy2/oO7QzTQ7O', 'admin', NULL, 1),
-- 5 Users hoạt động tích cực (Dùng để fake session ở phần sau)
(2, 'quangthai26', 'Chu Nguyen Quang Thai', 'quangthai@gmail.com', '0988888888', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 3, 1),
(3, 'hoanglong99', 'Le Hoang Long', 'hoanglong99@gmail.com', '0977777777', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 2, 1),
(4, 'minhtu_dang', 'Dang Minh Tu', 'minhtu@gmail.com', '0966666666', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 1, 1),
(5, 'linhdan_pro', 'Tran Linh Dan', 'linhdan@gmail.com', '0955555555', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 2, 1),
(6, 'tienanh_dev', 'Nguyen Tien Anh', 'tienanh@gmail.com', '0944444444', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 3, 1),
-- 9 Users thông thường khác ít hoạt động hơn
(7, 'bavuong91', 'Nguyen Ba Vuong', 'vuongba@gmail.com', '0933333333', '$2a$10$0Xlm1qRY', 'user', 1, 1),
(8, 'khanhhuyen', 'Pham Khanh Huyen', 'huyenkhanh@gmail.com', '0922222222', '$2a$10$0Xlm1qRY', 'user', 1, 1),
(9, 'ducmanh_it', 'Vu Duc Manh', 'manhduc@gmail.com', '0911111111', '$2a$10$0Xlm1qRY', 'user', 2, 1),
(10, 'thuha_98', 'Le Thu Ha', 'ha_thu98@gmail.com', '0900000000', '$2a$10$0Xlm1qRY', 'user', 2, 1),
(11, 'quocbao_vp', 'Tran Quoc Bao', 'baoquoc@gmail.com', '0899999999', '$2a$10$0Xlm1qRY', 'user', 1, 1),
(12, 'ngocanh_cute', 'Hoang Ngoc Anh', 'ngocanh@gmail.com', '0888888888', '$2a$10$0Xlm1qRY', 'user', 3, 1),
(13, 'duyhung_gamer', 'Do Duy Hung', 'hungduy@gmail.com', '0877777777', '$2a$10$0Xlm1qRY', 'user', 3, 1),
(14, 'thanhthuy_2k', 'Nguyen Thanh Thuy', 'thuythanh@gmail.com', '0866666666', '$2a$10$0Xlm1qRY', 'user', 1, 1),
(15, 'vanphuc_it', 'Bui Van Phuc', 'phucvan@gmail.com', '0855555555', '$2a$10$0Xlm1qRY', 'user', 2, 1);

-- 2.7. Khởi tạo Ví tiền tương ứng cho 15 Users
INSERT INTO `wallets` (`id`, `user_id`, `balance`) VALUES
(1, 1, 0.00),   -- Admin
(2, 2, 450.00), -- User 2 (Thai) 
(3, 3, 320.00), -- User 3 (Long)
(4, 4, 150.00), -- User 4 (Tu)
(5, 5, 200.00), -- User 5 (Dan)
(6, 6, 600.00), -- User 6 (Anh)
(7, 7, 50.00),  (8, 8, 35.00),  (9, 9, 85.00),  (10, 10, 120.00),
(11, 11, 40.00), (12, 12, 300.00), (13, 13, 180.00), (14, 14, 25.00), (15, 15, 95.00);


-- ========================================================
-- 3. FAKE SESSIONS & TRANSACTION HISTORY (CHO 5 USERS TÍCH CỰC)
-- Thao tác nạp tiền -> Đăng ký/Thuê máy theo giờ -> Tạo phiên máy chạy
-- ========================================================

-- 3.1. Ghi nhận lịch sử nạp tiền thành công qua PayPal (Bảng payments)
INSERT INTO `payments` (`id`, `wallet_id`, `amount`, `payment_method`, `payment_status`, `transaction_id`, `paid_at`) VALUES
(1, 2, 500.00, 'paypal', 'success', 'TXN-THAI-777888', '2026-05-10 08:00:00'), -- Thai nạp 500
(2, 3, 350.00, 'paypal', 'success', 'TXN-LONG-112233', '2026-05-11 09:15:00'), -- Long nạp 350
(3, 4, 165.00, 'paypal', 'success', 'TXN-TU-445566', '2026-05-12 10:00:00'),   -- Tu nạp 165
(4, 5, 220.00, 'paypal', 'success', 'TXN-DAN-998877', '2026-05-12 14:20:00'),   -- Dan nạp 220
(5, 6, 600.00, 'paypal', 'success', 'TXN-ANH-554433', '2026-05-13 07:30:00');   -- Anh nạp 600

-- Ghi nhận biến động số dư trong Wallet Transactions lúc nạp tiền
INSERT INTO `wallet_transactions` (`wallet_id`, `amount`, `type`, `reference_id`, `note`, `created_at`) VALUES
(2, 500.00, 'top_up', 1, 'Nạp tiền tài khoản qua PayPal', '2026-05-10 08:00:00'),
(3, 350.00, 'top_up', 2, 'Nạp tiền tài khoản qua PayPal', '2026-05-11 09:15:00'),
(4, 165.00, 'top_up', 3, 'Nạp tiền tài khoản qua PayPal', '2026-05-12 10:00:00'),
(5, 220.00, 'top_up', 4, 'Nạp tiền tài khoản qua PayPal', '2026-05-12 14:20:00'),
(6, 600.00, 'top_up', 5, 'Nạp tiền tài khoản qua PayPal', '2026-05-13 07:30:00');

-- 3.2. Fake Bookings (Đặt máy) cho 5 Users này
INSERT INTO `bookings` (`id`, `user_id`, `spec_id`, `plan_id`, `pc_id`, `booking_type`, `total_hours`, `start_time`, `end_time`, `total_price`, `status`, `created_at`) VALUES
-- User 2 (Chu Nguyen Quang Thai) đăng ký Gói tháng Ultra AMD (Spec 6)
(1, 2, 6, 6, 22, 'subscription', NULL, '2026-05-10 09:00:00', '2026-06-09 09:00:00', 105.00, 'completed', '2026-05-10 08:45:00'),
-- User 3 (Le Hoang Long) đăng ký Gói tháng Pro Intel (Spec 3)
(2, 3, 3, 3, 11, 'subscription', NULL, '2026-05-11 10:00:00', '2026-06-10 10:00:00', 50.00, 'completed', '2026-05-11 09:45:00'),
-- User 4 (Dang Minh Tu) thuê máy theo giờ (Gói Basic AMD - Spec 2 - Máy số 2) trong 6 giờ
(3, 4, 2, NULL, 2, 'hourly', 6, '2026-05-12 11:00:00', '2026-05-12 17:00:00', 14.40, 'completed', '2026-05-12 10:55:00'),
-- User 5 (Tran Linh Dan) thuê máy theo giờ (Gói Pro AMD - Spec 4 - Máy số 12) trong 4 giờ
(4, 5, 4, NULL, 12, 'hourly', 4, '2026-05-12 15:00:00', '2026-05-12 19:00:00', 22.00, 'completed', '2026-05-12 14:50:00'),
-- User 6 (Nguyen Tien Anh) đăng ký Gói tháng Ultra Intel (Spec 5)
(5, 6, 5, 5, 21, 'subscription', NULL, '2026-05-13 08:00:00', '2026-06-12 08:00:00', 100.00, 'completed', '2026-05-13 07:45:00');

-- Ghi nhận trừ tiền tương ứng trong ví sau khi Book máy thành công
INSERT INTO `wallet_transactions` (`wallet_id`, `amount`, `type`, `reference_id`, `note`, `created_at`) VALUES
(2, -105.00, 'deduct', 1, 'Thanh toán đăng ký gói tháng Ultra AMD', '2026-05-10 08:45:00'),
(3, -50.00, 'deduct', 2, 'Thanh toán đăng ký gói tháng Pro Intel', '2026-05-11 09:45:00'),
(4, -14.40, 'deduct', 3, 'Thanh toán thuê máy Basic AMD theo giờ', '2026-05-12 10:55:00'),
(5, -22.00, 'deduct', 4, 'Thanh toán thuê máy Pro AMD theo giờ', '2026-05-12 14:50:00'),
(6, -100.00, 'deduct', 5, 'Thanh toán đăng ký gói tháng Ultra Intel', '2026-05-13 07:45:00');

-- 3.3. Fake Sessions (Các phiên làm việc thực tế được ghi nhận trên máy trạm)
INSERT INTO `sessions` (`id`, `booking_id`, `user_id`, `pc_id`, `start_time`, `end_time`, `total_cost`, `status`) VALUES
-- Phiên chơi máy của Thái (User 2) trên máy trạm Ultra AMD số 22 (Đã kết thúc phiên thứ nhất)
(1, 1, 2, 22, '2026-05-10 09:00:00', '2026-05-10 14:00:00', 0.00, 'ended'),
-- Phiên chơi máy của Long (User 3) trên máy trạm Pro Intel số 11 (Đã kết thúc phiên thứ nhất)
(2, 2, 3, 11, '2026-05-11 10:00:00', '2026-05-11 13:30:00', 0.00, 'ended'),
-- Phiên sử dụng của Tú (User 4) chạy suốt 6 tiếng trực tiếp đúng giờ đặt thuê máy 
(3, 3, 4, 2, '2026-05-12 11:00:00', '2026-05-12 17:00:00', 14.40, 'ended'),
-- Phiên sử dụng của Đan (User 5) chạy hết 4 tiếng trọn vẹn
(4, 4, 5, 12, '2026-05-12 15:00:00', '2026-05-12 19:00:00', 22.00, 'ended'),
-- Phiên kết nối của Tiến Anh (User 6) trên quái vật Ultra Intel số 21 (Đã kết thúc phiên đầu tiên)
(5, 5, 6, 21, '2026-05-13 08:00:00', '2026-05-13 12:00:00', 0.00, 'ended');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;