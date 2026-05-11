-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 27, 2026 at 02:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `onnetpc`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_recommendations`
--

CREATE TABLE `ai_recommendations` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `recommended_spec_id` bigint(20) NOT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `pc_id` bigint(20) DEFAULT NULL,
  `booking_type` varchar(50) NOT NULL,
  `total_hours` int(11) DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `spec_id`, `pc_id`, `booking_type`, `total_hours`, `start_time`, `end_time`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 2, 'hourly', 1, '2026-03-27 06:04:24', '2026-03-27 07:04:24', 3.20, 'completed', '2026-03-27 13:04:24', '2026-03-27 06:34:22');

-- --------------------------------------------------------

--
-- Table structure for table `email_verification_tokens`
--

CREATE TABLE `email_verification_tokens` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_verification_tokens`
--

INSERT INTO `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 1, '144143', '2026-03-27 06:15:42', '2026-03-27 13:00:42', '2026-03-27 13:00:42');

-- --------------------------------------------------------

--
-- Table structure for table `membership_tiers`
--

CREATE TABLE `membership_tiers` (
  `id` bigint(20) NOT NULL,
  `tier_name` varchar(50) NOT NULL,
  `tier_level` int(11) NOT NULL,
  `monthly_fee` decimal(10,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `storage_limit_gb` int(11) DEFAULT NULL,
  `free_hours_per_month` int(11) DEFAULT 0,
  `rollover_hours_limit` int(11) DEFAULT 0,
  `advance_booking_days` int(11) DEFAULT 0,
  `queue_priority` int(11) DEFAULT 99,
  `can_access_exclusive_specs` tinyint(1) DEFAULT 0,
  `support_level` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_tiers`
--

INSERT INTO `membership_tiers` (`id`, `tier_name`, `tier_level`, `monthly_fee`, `discount_percentage`, `storage_limit_gb`, `free_hours_per_month`, `rollover_hours_limit`, `advance_booking_days`, `queue_priority`, `can_access_exclusive_specs`, `support_level`, `is_active`, `created_at`) VALUES
(1, 'Basic', 1, 19.00, 0.00, NULL, 0, 0, 0, 30, 0, 'standard', 1, '2026-03-27 13:00:00'),
(2, 'Pro', 2, 39.00, 5.00, NULL, 0, 0, 0, 20, 0, 'priority', 1, '2026-03-27 13:00:00'),
(3, 'Ultra', 3, 69.00, 10.00, NULL, 0, 0, 0, 10, 1, 'vip', 1, '2026-03-27 13:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `membership_tier_spec_mappings`
--

CREATE TABLE `membership_tier_spec_mappings` (
  `id` bigint(20) NOT NULL,
  `tier_id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `is_refundable` tinyint(1) DEFAULT 0,
  `refunded_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `paid_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `wallet_id`, `amount`, `payment_method`, `payment_status`, `transaction_id`, `is_refundable`, `refunded_at`, `paid_at`, `created_at`) VALUES
(1, 1, 1000.00, 'paypal', 'success', '11097797GY6922534', 0, '2026-03-27 13:03:27', '2026-03-27 06:03:51', '2026-03-27 13:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `pcs`
--

CREATE TABLE `pcs` (
  `id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `status` varchar(50) DEFAULT 'available',
  `location` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pcs`
--

INSERT INTO `pcs` (`id`, `spec_id`, `status`, `location`, `updated_at`, `last_used_at`, `deleted_at`) VALUES
(1, 1, 'available', 'Zone A - Seat 01', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(2, 2, 'available', 'Zone A - Seat 02', '2026-03-27 06:34:22', '2026-03-27 06:33:49', '2026-03-27 13:25:09'),
(3, 3, 'available', 'Zone A - Seat 03', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(4, 4, 'available', 'Zone B - Seat 01', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(5, 5, 'available', 'Zone B - Seat 02', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(6, 6, 'available', 'Zone B - Seat 03', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(7, 7, 'available', 'Zone C - Seat 01', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(8, 8, 'available', 'Zone C - Seat 02', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(9, 9, 'available', 'Zone C - Seat 03', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09'),
(10, 10, 'available', 'Zone D - Seat 01', '2026-03-27 13:25:09', NULL, '2026-03-27 13:25:09');

-- --------------------------------------------------------

--
-- Table structure for table `pc_specs`
--

CREATE TABLE `pc_specs` (
  `id` bigint(20) NOT NULL,
  `spec_name` varchar(100) NOT NULL,
  `cpu` varchar(100) DEFAULT NULL,
  `gpu` varchar(100) DEFAULT NULL,
  `ram` int(11) DEFAULT NULL,
  `storage` int(11) DEFAULT NULL,
  `os` varchar(100) DEFAULT NULL,
  `price_per_hour` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `is_exclusive` tinyint(1) DEFAULT 0,
  `is_available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pc_specs`
--

INSERT INTO `pc_specs` (`id`, `spec_name`, `cpu`, `gpu`, `ram`, `storage`, `os`, `price_per_hour`, `description`, `is_exclusive`, `is_available`, `created_at`) VALUES
(1, 'Nebula Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, 'Entry gaming and school projects', 0, 1, '2026-03-27 13:01:51'),
(2, 'Nebula Plus', 'Intel Core i5-13400F', 'NVIDIA RTX 4060', 16, 1024, 'Windows 11', 3.20, '1080p ultra gaming and livestreaming', 0, 1, '2026-03-27 13:01:51'),
(3, 'Nebula Creator', 'AMD Ryzen 7 5700X', 'NVIDIA RTX 4060 Ti', 32, 1024, 'Windows 11', 3.80, 'Video editing and design workflows', 0, 1, '2026-03-27 13:01:51'),
(4, 'Orion Balanced', 'Intel Core i7-12700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 4.70, 'Balanced gaming and productivity', 0, 1, '2026-03-27 13:01:51'),
(5, 'Orion Pro', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 2048, 'Windows 11', 5.40, '4K content creation and rendering', 0, 1, '2026-03-27 13:01:51'),
(6, 'Atlas Gamer', 'Intel Core i7-13700K', 'NVIDIA RTX 4080', 32, 2048, 'Windows 11', 6.90, 'High refresh AAA gaming setup', 0, 1, '2026-03-27 13:01:51'),
(7, 'Atlas Creator', 'AMD Ryzen 9 7900X', 'NVIDIA RTX 4080 Super', 64, 2048, 'Windows 11', 7.80, 'Heavy Adobe and Blender projects', 0, 1, '2026-03-27 13:01:51'),
(8, 'Titan Workstation', 'Intel Core i9-13900K', 'NVIDIA RTX 4090', 64, 4096, 'Windows 11 Pro', 9.50, 'Workstation class compute and rendering', 1, 1, '2026-03-27 13:01:51'),
(9, 'Titan AI', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 128, 4096, 'Ubuntu 22.04', 10.50, 'ML experiments and container workflows', 1, 1, '2026-03-27 13:01:51'),
(10, 'Zephyr Dev', 'AMD Ryzen 5 7600', 'NVIDIA RTX 3070', 32, 1024, 'Ubuntu 22.04', 4.20, 'Programming, docker, and test automation', 0, 1, '2026-03-27 13:01:51');

--
-- Dumping data for table `membership_tier_spec_mappings`
--

INSERT INTO `membership_tier_spec_mappings` (`id`, `tier_id`, `spec_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 10),
(6, 2, 5),
(7, 2, 6),
(8, 2, 7),
(9, 3, 8),
(10, 3, 9);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `pc_id` bigint(20) NOT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `pc_id` bigint(20) NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `total_cost` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `booking_id`, `user_id`, `pc_id`, `start_time`, `end_time`, `total_cost`, `status`) VALUES
(1, 1, 1, 2, '2026-03-27 06:33:49', '2026-03-27 06:34:22', 3.20, 'completed');

-- --------------------------------------------------------

--
-- Table structure for table `session_files`
--

CREATE TABLE `session_files` (
  `id` bigint(20) NOT NULL,
  `session_id` bigint(20) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_queue`
--

CREATE TABLE `session_queue` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `tier_id` bigint(20) DEFAULT NULL,
  `queue_position` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'waiting',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` bigint(20) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `max_hours_per_day` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `plan_name`, `spec_id`, `duration_days`, `price`, `max_hours_per_day`, `is_active`, `created_at`) VALUES
(46, 'Nebula Starter - Weekly', 1, 7, 10.00, NULL, 1, '2026-03-27 13:02:06'),
(47, 'Nebula Plus - Weekly', 2, 7, 12.80, NULL, 1, '2026-03-27 13:02:06'),
(48, 'Nebula Creator - Weekly', 3, 7, 15.20, NULL, 1, '2026-03-27 13:02:06'),
(49, 'Orion Balanced - Weekly', 4, 7, 18.80, NULL, 1, '2026-03-27 13:02:06'),
(50, 'Orion Pro - Weekly', 5, 7, 21.60, NULL, 1, '2026-03-27 13:02:06'),
(51, 'Atlas Gamer - Weekly', 6, 7, 27.60, NULL, 1, '2026-03-27 13:02:06'),
(52, 'Atlas Creator - Weekly', 7, 7, 31.20, NULL, 1, '2026-03-27 13:02:06'),
(53, 'Titan Workstation - Weekly', 8, 7, 38.00, NULL, 1, '2026-03-27 13:02:06'),
(54, 'Titan AI - Weekly', 9, 7, 42.00, NULL, 1, '2026-03-27 13:02:06'),
(55, 'Zephyr Dev - Weekly', 10, 7, 16.80, NULL, 1, '2026-03-27 13:02:06'),
(61, 'Nebula Starter - Monthly', 1, 30, 30.00, NULL, 1, '2026-03-27 13:02:06'),
(62, 'Nebula Plus - Monthly', 2, 30, 38.40, NULL, 1, '2026-03-27 13:02:06'),
(63, 'Nebula Creator - Monthly', 3, 30, 45.60, NULL, 1, '2026-03-27 13:02:06'),
(64, 'Orion Balanced - Monthly', 4, 30, 56.40, NULL, 1, '2026-03-27 13:02:06'),
(65, 'Orion Pro - Monthly', 5, 30, 64.80, NULL, 1, '2026-03-27 13:02:06'),
(66, 'Atlas Gamer - Monthly', 6, 30, 82.80, NULL, 1, '2026-03-27 13:02:06'),
(67, 'Atlas Creator - Monthly', 7, 30, 93.60, NULL, 1, '2026-03-27 13:02:06'),
(68, 'Titan Workstation - Monthly', 8, 30, 114.00, NULL, 1, '2026-03-27 13:02:06'),
(69, 'Titan AI - Monthly', 9, 30, 126.00, NULL, 1, '2026-03-27 13:02:06'),
(70, 'Zephyr Dev - Monthly', 10, 30, 50.40, NULL, 1, '2026-03-27 13:02:06'),
(76, 'Nebula Starter - Yearly', 1, 365, 300.00, NULL, 1, '2026-03-27 13:02:06'),
(77, 'Nebula Plus - Yearly', 2, 365, 384.00, NULL, 1, '2026-03-27 13:02:06'),
(78, 'Nebula Creator - Yearly', 3, 365, 456.00, NULL, 1, '2026-03-27 13:02:06'),
(79, 'Orion Balanced - Yearly', 4, 365, 564.00, NULL, 1, '2026-03-27 13:02:06'),
(80, 'Orion Pro - Yearly', 5, 365, 648.00, NULL, 1, '2026-03-27 13:02:06'),
(81, 'Atlas Gamer - Yearly', 6, 365, 828.00, NULL, 1, '2026-03-27 13:02:06'),
(82, 'Atlas Creator - Yearly', 7, 365, 936.00, NULL, 1, '2026-03-27 13:02:06'),
(83, 'Titan Workstation - Yearly', 8, 365, 1140.00, NULL, 1, '2026-03-27 13:02:06'),
(84, 'Titan AI - Yearly', 9, 365, 1260.00, NULL, 1, '2026-03-27 13:02:06'),
(85, 'Zephyr Dev - Yearly', 10, 365, 504.00, NULL, 1, '2026-03-27 13:02:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
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
  `deleted_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `full_name`, `email`, `phone`, `password_hash`, `avatar`, `role`, `tier_id`, `is_verified`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'kruwulvn', 'Khanh', 'kruwulvn@gmail.com', '123123123', '$2a$10$kO1OnNVFcKi/ajckCNVdreNka82gguByaaDua9v6/oTxCx2e4hyjq', NULL, 'user', NULL, 1, 1, '2026-03-27 13:00:42', '2026-03-27 06:01:12', '2026-03-27 13:00:42');

-- --------------------------------------------------------

--
-- Table structure for table `user_memberships`
--

CREATE TABLE `user_memberships` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `tier_id` bigint(20) NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` varchar(50) DEFAULT 'active',
  `auto_renew` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `plan_id` bigint(20) NOT NULL,
  `pc_id` bigint(20) DEFAULT NULL,
  `start_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` varchar(50) DEFAULT 'active',
  `auto_renew` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `balance` decimal(10,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `updated_at`) VALUES
(1, 1, 996.80, '2026-03-27 06:04:33');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `wallet_id`, `amount`, `type`, `reference_id`, `note`, `created_at`) VALUES
(1, 1, 1000.00, 'top_up', 1, 'PayPal top-up order 11097797GY6922534', '2026-03-27 13:03:51'),
(3, 1, -3.20, 'deduct', 1, 'Booking payment', '2026-03-27 13:04:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `recommended_spec_id` (`recommended_spec_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `spec_id` (`spec_id`),
  ADD KEY `pc_id` (`pc_id`);

--
-- Indexes for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `membership_tiers`
--
ALTER TABLE `membership_tiers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `membership_tier_spec_mappings`
--
ALTER TABLE `membership_tier_spec_mappings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_membership_tier_spec` (`tier_id`,`spec_id`),
  ADD UNIQUE KEY `uq_membership_spec_single_tier` (`spec_id`),
  ADD KEY `idx_membership_tier_spec_tier` (`tier_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_id` (`wallet_id`);

--
-- Indexes for table `pcs`
--
ALTER TABLE `pcs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `spec_id` (`spec_id`);

--
-- Indexes for table `pc_specs`
--
ALTER TABLE `pc_specs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `pc_id` (`pc_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `pc_id` (`pc_id`);

--
-- Indexes for table `session_files`
--
ALTER TABLE `session_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `session_queue`
--
ALTER TABLE `session_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `spec_id` (`spec_id`),
  ADD KEY `tier_id` (`tier_id`),
  ADD KEY `idx_session_queue_tier_status_position` (`tier_id`,`status`,`queue_position`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `spec_id` (`spec_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `tier_id` (`tier_id`);

--
-- Indexes for table `user_memberships`
--
ALTER TABLE `user_memberships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tier_id` (`tier_id`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `pc_id` (`pc_id`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_wallet_tx_wallet_type_ref` (`wallet_id`,`type`,`reference_id`),
  ADD KEY `idx_wallet_tx_wallet_created` (`wallet_id`,`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `membership_tiers`
--
ALTER TABLE `membership_tiers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `membership_tier_spec_mappings`
--
ALTER TABLE `membership_tier_spec_mappings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pcs`
--
ALTER TABLE `pcs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pc_specs`
--
ALTER TABLE `pc_specs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `session_files`
--
ALTER TABLE `session_files`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session_queue`
--
ALTER TABLE `session_queue`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_memberships`
--
ALTER TABLE `user_memberships`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD CONSTRAINT `ai_recommendations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `ai_recommendations_ibfk_2` FOREIGN KEY (`recommended_spec_id`) REFERENCES `pc_specs` (`id`);

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`),
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`);

--
-- Constraints for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

--
-- Constraints for table `pcs`
--
ALTER TABLE `pcs`
  ADD CONSTRAINT `pcs_ibfk_1` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`);

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`);

--
-- Constraints for table `session_files`
--
ALTER TABLE `session_files`
  ADD CONSTRAINT `session_files_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`);

--
-- Constraints for table `session_queue`
--
ALTER TABLE `session_queue`
  ADD CONSTRAINT `session_queue_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD CONSTRAINT `session_queue_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `session_queue_ibfk_3` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`),
  ADD CONSTRAINT `session_queue_ibfk_4` FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`);

--
-- Constraints for table `membership_tier_spec_mappings`
--
ALTER TABLE `membership_tier_spec_mappings`
  ADD CONSTRAINT `membership_tier_spec_mappings_ibfk_1` FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`),
  ADD CONSTRAINT `membership_tier_spec_mappings_ibfk_2` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);

--
-- Constraints for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD CONSTRAINT `subscription_plans_ibfk_1` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`);

--
-- Constraints for table `user_memberships`
--
ALTER TABLE `user_memberships`
  ADD CONSTRAINT `user_memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_memberships_ibfk_2` FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`);

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `user_subscriptions_ibfk_3` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`);

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
