-- Migration V8: Complete Schema Mapping for Onnet-PC
-- This migration applies the complete database schema with realistic test data
-- Mapping: 15 users, 3 tiers, 6 specs, 30 PCs, 6 subscription plans

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- ========================================================
-- SEED DATA: Membership Tiers
-- ========================================================

DELETE FROM membership_tier_spec_mappings WHERE tier_id IN (1, 2, 3);
DELETE FROM membership_tiers WHERE id IN (1, 2, 3);

INSERT INTO `membership_tiers` (`id`, `tier_name`, `tier_level`, `monthly_fee`, `discount_percentage`, `storage_limit_gb`, `free_hours_per_month`, `rollover_hours_limit`, `advance_booking_days`, `queue_priority`, `can_access_exclusive_specs`, `support_level`, `is_active`, `created_at`) VALUES
(1, 'Basic', 1, 15.00, 0.00, NULL, 0, 0, 0, 30, 0, 'standard', 1, NOW()),
(2, 'Pro', 2, 35.00, 5.00, NULL, 0, 0, 0, 20, 0, 'priority', 1, NOW()),
(3, 'Ultra', 3, 65.00, 10.00, NULL, 0, 0, 0, 10, 1, 'vip', 1, NOW());

-- ========================================================
-- SEED DATA: PC Specs (6 specs: 2 per tier)
-- ========================================================

DELETE FROM subscription_plans WHERE spec_id IN (1, 2, 3, 4, 5, 6);
DELETE FROM membership_tier_spec_mappings WHERE spec_id IN (1, 2, 3, 4, 5, 6);
DELETE FROM pc_specs WHERE id IN (1, 2, 3, 4, 5, 6);

INSERT INTO `pc_specs` (`id`, `spec_name`, `cpu`, `gpu`, `ram`, `storage`, `os`, `price_per_hour`, `description`, `is_exclusive`, `is_available`, `created_at`) VALUES
(1, 'Basic Intel Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, 'Phù hợp gaming Esports 1080p mượt mà', 0, 1, NOW()),
(2, 'Basic AMD Ryzen Core', 'AMD Ryzen 5 5600X', 'AMD Radeon RX 6600', 16, 512, 'Windows 11', 2.40, 'Hiệu năng gaming thuần túy tối ưu chi phí', 0, 1, NOW()),
(3, 'Pro Intel Gaming', 'Intel Core i7-13700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 5.00, 'Chiến mượt AAA Max Setting và Livestream', 0, 1, NOW()),
(4, 'Pro Ryzen Performance', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 1024, 'Windows 11', 5.50, 'Đồ họa đỉnh cao, xử lý đa nhiệm mượt mà', 0, 1, NOW()),
(5, 'Ultra Intel Ultimate', 'Intel Core i9-14900K', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.00, 'Siêu quái vật Workstation chuyên render và 4K Gaming', 1, 1, NOW()),
(6, 'Ultra AMD Beast', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.50, 'Cực đỉnh xử lý thuật toán AI và đồ họa nặng', 1, 1, NOW());

-- ========================================================
-- SEED DATA: Tier to Spec Mapping
-- ========================================================

INSERT INTO `membership_tier_spec_mappings` (`tier_id`, `spec_id`) VALUES
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5), (3, 6);

-- ========================================================
-- SEED DATA: Subscription Plans
-- ========================================================

DELETE FROM subscription_plans WHERE spec_id IN (1, 2, 3, 4, 5, 6);

INSERT INTO `subscription_plans` (`id`, `plan_name`, `spec_id`, `duration_days`, `price`, `max_hours_per_day`, `is_active`, `created_at`) VALUES
(1, 'Basic Intel - Weekly', 1, 7, 15.00, NULL, 1, NOW()),
(2, 'Basic AMD - Weekly', 2, 7, 14.00, NULL, 1, NOW()),
(3, 'Pro Intel - Monthly', 3, 30, 50.00, NULL, 1, NOW()),
(4, 'Pro AMD - Monthly', 4, 30, 55.00, NULL, 1, NOW()),
(5, 'Ultra Intel - Monthly', 5, 30, 100.00, NULL, 1, NOW()),
(6, 'Ultra AMD - Monthly', 6, 30, 105.00, NULL, 1, NOW());

-- ========================================================
-- SEED DATA: PCs (30 machines: 10 per tier)
-- ========================================================

DELETE FROM pcs WHERE id BETWEEN 1 AND 30;

INSERT INTO `pcs` (`id`, `spec_id`, `status`, `location`, `updated_at`) VALUES
(1, 1, 'available', 'Zone Basic - Seat 01', NOW()), (2, 2, 'available', 'Zone Basic - Seat 02', NOW()),
(3, 1, 'available', 'Zone Basic - Seat 03', NOW()), (4, 2, 'available', 'Zone Basic - Seat 04', NOW()),
(5, 1, 'available', 'Zone Basic - Seat 05', NOW()), (6, 2, 'available', 'Zone Basic - Seat 06', NOW()),
(7, 1, 'available', 'Zone Basic - Seat 07', NOW()), (8, 2, 'available', 'Zone Basic - Seat 08', NOW()),
(9, 1, 'available', 'Zone Basic - Seat 09', NOW()), (10, 2, 'available', 'Zone Basic - Seat 10', NOW()),
(11, 3, 'available', 'Zone Pro - Seat 01', NOW()), (12, 4, 'available', 'Zone Pro - Seat 02', NOW()),
(13, 3, 'available', 'Zone Pro - Seat 03', NOW()), (14, 4, 'available', 'Zone Pro - Seat 04', NOW()),
(15, 3, 'available', 'Zone Pro - Seat 05', NOW()), (16, 4, 'available', 'Zone Pro - Seat 06', NOW()),
(17, 3, 'available', 'Zone Pro - Seat 07', NOW()), (18, 4, 'available', 'Zone Pro - Seat 08', NOW()),
(19, 3, 'available', 'Zone Pro - Seat 09', NOW()), (20, 4, 'available', 'Zone Pro - Seat 10', NOW()),
(21, 5, 'available', 'Zone Ultra - Seat 01', NOW()), (22, 6, 'available', 'Zone Ultra - Seat 02', NOW()),
(23, 5, 'available', 'Zone Ultra - Seat 03', NOW()), (24, 6, 'available', 'Zone Ultra - Seat 04', NOW()),
(25, 5, 'available', 'Zone Ultra - Seat 05', NOW()), (26, 6, 'available', 'Zone Ultra - Seat 06', NOW()),
(27, 5, 'available', 'Zone Ultra - Seat 07', NOW()), (28, 6, 'available', 'Zone Ultra - Seat 08', NOW()),
(29, 5, 'available', 'Zone Ultra - Seat 09', NOW()), (30, 6, 'available', 'Zone Ultra - Seat 10', NOW());

-- ========================================================
-- SEED DATA: Users (15: 1 admin + 14 regular users)
-- ========================================================

DELETE FROM users WHERE id BETWEEN 1 AND 15;

INSERT INTO `users` (`id`, `username`, `full_name`, `email`, `phone`, `password_hash`, `role`, `tier_id`, `is_verified`, `is_active`, `created_at`) VALUES
(1, 'admin_cyber', 'Nguyen Van Admin', 'admin@onnetpc.com', '0911223344', '$2a$10$mhtsJJQPNjy2/oO7QzTQ7O', 'admin', NULL, 1, 1, NOW()),
(2, 'quangthai26', 'Chu Nguyen Quang Thai', 'quangthai@gmail.com', '0988888888', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 3, 1, 1, NOW()),
(3, 'hoanglong99', 'Le Hoang Long', 'hoanglong99@gmail.com', '0977777777', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 2, 1, 1, NOW()),
(4, 'minhtu_dang', 'Dang Minh Tu', 'minhtu@gmail.com', '0966666666', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 1, 1, 1, NOW()),
(5, 'linhdan_pro', 'Tran Linh Dan', 'linhdan@gmail.com', '0955555555', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 2, 1, 1, NOW()),
(6, 'tienanh_dev', 'Nguyen Tien Anh', 'tienanh@gmail.com', '0944444444', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', 'user', 3, 1, 1, NOW()),
(7, 'bavuong91', 'Nguyen Ba Vuong', 'vuongba@gmail.com', '0933333333', '$2a$10$0Xlm1qRY', 'user', 1, 1, 1, NOW()),
(8, 'khanhhuyen', 'Pham Khanh Huyen', 'huyenkhanh@gmail.com', '0922222222', '$2a$10$0Xlm1qRY', 'user', 1, 1, 1, NOW()),
(9, 'ducmanh_it', 'Vu Duc Manh', 'manhduc@gmail.com', '0911111111', '$2a$10$0Xlm1qRY', 'user', 2, 1, 1, NOW()),
(10, 'thuha_98', 'Le Thu Ha', 'ha_thu98@gmail.com', '0900000000', '$2a$10$0Xlm1qRY', 'user', 2, 1, 1, NOW()),
(11, 'quocbao_vp', 'Tran Quoc Bao', 'baoquoc@gmail.com', '0899999999', '$2a$10$0Xlm1qRY', 'user', 1, 1, 1, NOW()),
(12, 'ngocanh_cute', 'Hoang Ngoc Anh', 'ngocanh@gmail.com', '0888888888', '$2a$10$0Xlm1qRY', 'user', 3, 1, 1, NOW()),
(13, 'duyhung_gamer', 'Do Duy Hung', 'hungduy@gmail.com', '0877777777', '$2a$10$0Xlm1qRY', 'user', 3, 1, 1, NOW()),
(14, 'thanhthuy_2k', 'Nguyen Thanh Thuy', 'thuythanh@gmail.com', '0866666666', '$2a$10$0Xlm1qRY', 'user', 1, 1, 1, NOW()),
(15, 'vanphuc_it', 'Bui Van Phuc', 'phucvan@gmail.com', '0855555555', '$2a$10$0Xlm1qRY', 'user', 2, 1, 1, NOW());

-- ========================================================
-- SEED DATA: Wallets (15 wallets with realistic balances)
-- ========================================================

DELETE FROM wallets WHERE id BETWEEN 1 AND 15;

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `updated_at`) VALUES
(1, 1, 0.00, NOW()), (2, 2, 450.00, NOW()), (3, 3, 320.00, NOW()),
(4, 4, 150.00, NOW()), (5, 5, 200.00, NOW()), (6, 6, 600.00, NOW()),
(7, 7, 50.00, NOW()), (8, 8, 35.00, NOW()), (9, 9, 85.00, NOW()),
(10, 10, 120.00, NOW()), (11, 11, 40.00, NOW()), (12, 12, 300.00, NOW()),
(13, 13, 180.00, NOW()), (14, 14, 25.00, NOW()), (15, 15, 95.00, NOW());

-- ========================================================
-- SEED DATA: Bookings (5 completed bookings for 5 active users)
-- ========================================================

DELETE FROM bookings WHERE id BETWEEN 1 AND 5;

INSERT INTO `bookings` (`id`, `user_id`, `spec_id`, `plan_id`, `pc_id`, `booking_type`, `total_hours`, `start_time`, `end_time`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 6, 6, 22, 'subscription', NULL, '2026-05-10 09:00:00', '2026-06-09 09:00:00', 105.00, 'paid', '2026-05-10 08:45:00', '2026-05-10 08:45:00'),
(2, 3, 3, 3, 11, 'subscription', NULL, '2026-05-11 10:00:00', '2026-06-10 10:00:00', 50.00, 'paid', '2026-05-11 09:45:00', '2026-05-11 09:45:00'),
(3, 4, 2, NULL, 2, 'hourly', 6, '2026-05-12 11:00:00', '2026-05-12 17:00:00', 14.40, 'completed', '2026-05-12 10:55:00', '2026-05-12 17:00:00'),
(4, 5, 4, NULL, 12, 'hourly', 4, '2026-05-12 15:00:00', '2026-05-12 19:00:00', 22.00, 'completed', '2026-05-12 14:50:00', '2026-05-12 19:00:00'),
(5, 6, 5, 5, 21, 'subscription', NULL, '2026-05-13 08:00:00', '2026-06-12 08:00:00', 100.00, 'paid', '2026-05-13 07:45:00', '2026-05-13 07:45:00');

-- ========================================================
-- SEED DATA: Sessions (5 completed sessions)
-- ========================================================

DELETE FROM sessions WHERE id BETWEEN 1 AND 5;

INSERT INTO `sessions` (`id`, `booking_id`, `user_id`, `pc_id`, `start_time`, `end_time`, `total_cost`, `status`) VALUES
(1, 1, 2, 22, '2026-05-10 09:00:00', '2026-05-10 14:00:00', 0.00, 'ended'),
(2, 2, 3, 11, '2026-05-11 10:00:00', '2026-05-11 13:30:00', 0.00, 'ended'),
(3, 3, 4, 2, '2026-05-12 11:00:00', '2026-05-12 17:00:00', 14.40, 'ended'),
(4, 4, 5, 12, '2026-05-12 15:00:00', '2026-05-12 19:00:00', 22.00, 'ended'),
(5, 5, 6, 21, '2026-05-13 08:00:00', '2026-05-13 12:00:00', 0.00, 'ended');

-- ========================================================
-- SEED DATA: Wallet Transactions
-- ========================================================

DELETE FROM wallet_transactions WHERE wallet_id BETWEEN 1 AND 6;

INSERT INTO `wallet_transactions` (`wallet_id`, `amount`, `type`, `reference_id`, `note`, `created_at`) VALUES
(2, 500.00, 'top_up', 1, 'Nạp tiền tài khoản qua PayPal', '2026-05-10 08:00:00'),
(3, 350.00, 'top_up', 2, 'Nạp tiền tài khoản qua PayPal', '2026-05-11 09:15:00'),
(4, 165.00, 'top_up', 3, 'Nạp tiền tài khoản qua PayPal', '2026-05-12 10:00:00'),
(5, 220.00, 'top_up', 4, 'Nạp tiền tài khoản qua PayPal', '2026-05-12 14:20:00'),
(6, 600.00, 'top_up', 5, 'Nạp tiền tài khoản qua PayPal', '2026-05-13 07:30:00'),
(2, -105.00, 'deduct', 1, 'Thanh toán đăng ký gói tháng Ultra AMD', '2026-05-10 08:45:00'),
(3, -50.00, 'deduct', 2, 'Thanh toán đăng ký gói tháng Pro Intel', '2026-05-11 09:45:00'),
(4, -14.40, 'deduct', 3, 'Thanh toán thuê máy Basic AMD theo giờ', '2026-05-12 10:55:00'),
(5, -22.00, 'deduct', 4, 'Thanh toán thuê máy Pro AMD theo giờ', '2026-05-12 14:50:00'),
(6, -100.00, 'deduct', 5, 'Thanh toán đăng ký gói tháng Ultra Intel', '2026-05-13 07:45:00');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
