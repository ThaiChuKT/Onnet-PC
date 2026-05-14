-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 14, 2026 at 08:42 PM
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
  `reason` varchar(255) DEFAULT NULL,
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
  `plan_id` bigint(20) DEFAULT NULL,
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

INSERT INTO `bookings` (`id`, `user_id`, `spec_id`, `plan_id`, `pc_id`, `booking_type`, `total_hours`, `start_time`, `end_time`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 6, 6, 22, 'subscription', NULL, '2026-05-10 09:00:00', '2026-06-09 09:00:00', 200.00, 'completed', '2026-05-10 08:45:00', '0000-00-00 00:00:00'),
(2, 3, 3, 3, 11, 'subscription', NULL, '2026-05-11 10:00:00', '2026-06-10 10:00:00', 100.00, 'completed', '2026-05-11 09:45:00', '0000-00-00 00:00:00'),
(3, 4, 2, NULL, 2, 'hourly', 6, '2026-05-12 11:00:00', '2026-05-12 17:00:00', 15.00, 'completed', '2026-05-12 10:55:00', '0000-00-00 00:00:00'),
(4, 5, 4, NULL, 12, 'hourly', 4, '2026-05-12 15:00:00', '2026-05-12 19:00:00', 20.00, 'completed', '2026-05-12 14:50:00', '0000-00-00 00:00:00'),
(5, 6, 5, 5, 21, 'subscription', NULL, '2026-05-13 08:00:00', '2026-06-12 08:00:00', 200.00, 'completed', '2026-05-13 07:45:00', '0000-00-00 00:00:00');

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

-- --------------------------------------------------------

--
-- Table structure for table `membership_tiers`
--

CREATE TABLE `membership_tiers` (
  `id` bigint(20) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_tiers`
--

INSERT INTO `membership_tiers` (`id`, `tier_name`, `tier_level`, `monthly_fee`, `discount_percentage`, `storage_limit_gb`, `free_hours_per_month`, `rollover_hours_limit`, `advance_booking_days`, `queue_priority`, `can_access_exclusive_specs`, `support_level`, `is_active`, `created_at`) VALUES
(1, 'Basic', 1, 15.00, 0.00, NULL, 0, 0, 0, 30, 0, 'standard', 1, '2026-05-14 16:28:47'),
(2, 'Pro', 2, 35.00, 5.00, NULL, 0, 0, 0, 20, 0, 'priority', 1, '2026-05-14 16:28:47'),
(3, 'Ultra', 3, 65.00, 10.00, NULL, 0, 0, 0, 10, 1, 'vip', 1, '2026-05-14 16:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `membership_tier_spec_mappings`
--

CREATE TABLE `membership_tier_spec_mappings` (
  `id` bigint(20) NOT NULL,
  `tier_id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `membership_tier_spec_mappings`
--

INSERT INTO `membership_tier_spec_mappings` (`id`, `tier_id`, `spec_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 3),
(4, 2, 4),
(5, 3, 5),
(6, 3, 6);

-- --------------------------------------------------------

--
-- Table structure for table `moonlight_command_logs`
--

CREATE TABLE `moonlight_command_logs` (
  `id` bigint(20) NOT NULL,
  `host_id` bigint(20) NOT NULL,
  `requested_by` bigint(20) DEFAULT NULL,
  `action` varchar(20) NOT NULL,
  `command_text` longtext NOT NULL,
  `status` varchar(20) NOT NULL,
  `output_text` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `moonlight_host_actions`
--

CREATE TABLE `moonlight_host_actions` (
  `id` bigint(20) NOT NULL,
  `host_id` bigint(20) NOT NULL,
  `booking_id` bigint(20) DEFAULT NULL,
  `requested_by` bigint(20) DEFAULT NULL,
  `action_type` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `pin` varchar(20) DEFAULT NULL,
  `request_source` varchar(30) DEFAULT NULL,
  `request_note` varchar(500) DEFAULT NULL,
  `result_text` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
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
(1, 2, 500.00, 'paypal', 'success', 'TXN-THAI-777888', 0, '2026-05-14 16:28:47', '2026-05-10 08:00:00', '2026-05-14 16:28:47'),
(2, 3, 350.00, 'paypal', 'success', 'TXN-LONG-112233', 0, '2026-05-14 16:28:47', '2026-05-11 09:15:00', '2026-05-14 16:28:47'),
(3, 4, 165.00, 'paypal', 'success', 'TXN-TU-445566', 0, '2026-05-14 16:28:47', '2026-05-12 10:00:00', '2026-05-14 16:28:47'),
(4, 5, 220.00, 'paypal', 'success', 'TXN-DAN-998877', 0, '2026-05-14 16:28:47', '2026-05-12 14:20:00', '2026-05-14 16:28:47'),
(5, 6, 600.00, 'paypal', 'success', 'TXN-ANH-554433', 0, '2026-05-14 16:28:47', '2026-05-13 07:30:00', '2026-05-14 16:28:47');

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
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pcs`
--

INSERT INTO `pcs` (`id`, `spec_id`, `status`, `location`, `updated_at`, `last_used_at`, `deleted_at`) VALUES
(1, 1, 'available', 'Zone Basic - Seat 01', '2026-05-14 16:28:47', NULL, NULL),
(2, 2, 'available', 'Zone Basic - Seat 02', '2026-05-14 16:28:47', NULL, NULL),
(3, 1, 'available', 'Zone Basic - Seat 03', '2026-05-14 16:28:47', NULL, NULL),
(4, 2, 'available', 'Zone Basic - Seat 04', '2026-05-14 16:28:47', NULL, NULL),
(5, 1, 'available', 'Zone Basic - Seat 05', '2026-05-14 16:28:47', NULL, NULL),
(6, 2, 'available', 'Zone Basic - Seat 06', '2026-05-14 16:28:47', NULL, NULL),
(7, 1, 'available', 'Zone Basic - Seat 07', '2026-05-14 16:28:47', NULL, NULL),
(8, 2, 'available', 'Zone Basic - Seat 08', '2026-05-14 16:28:47', NULL, NULL),
(9, 1, 'available', 'Zone Basic - Seat 09', '2026-05-14 16:28:47', NULL, NULL),
(10, 2, 'available', 'Zone Basic - Seat 10', '2026-05-14 16:28:47', NULL, NULL),
(11, 3, 'available', 'Zone Pro - Seat 01', '2026-05-14 16:28:47', NULL, NULL),
(12, 4, 'available', 'Zone Pro - Seat 02', '2026-05-14 16:28:47', NULL, NULL),
(13, 3, 'available', 'Zone Pro - Seat 03', '2026-05-14 16:28:47', NULL, NULL),
(14, 4, 'available', 'Zone Pro - Seat 04', '2026-05-14 16:28:47', NULL, NULL),
(15, 3, 'available', 'Zone Pro - Seat 05', '2026-05-14 16:28:47', NULL, NULL),
(16, 4, 'available', 'Zone Pro - Seat 06', '2026-05-14 16:28:47', NULL, NULL),
(17, 3, 'available', 'Zone Pro - Seat 07', '2026-05-14 16:28:47', NULL, NULL),
(18, 4, 'available', 'Zone Pro - Seat 08', '2026-05-14 16:28:47', NULL, NULL),
(19, 3, 'available', 'Zone Pro - Seat 09', '2026-05-14 16:28:47', NULL, NULL),
(20, 4, 'available', 'Zone Pro - Seat 10', '2026-05-14 16:28:47', NULL, NULL),
(21, 5, 'available', 'Zone Ultra - Seat 01', '2026-05-14 16:28:47', NULL, NULL),
(22, 6, 'available', 'Zone Ultra - Seat 02', '2026-05-14 16:28:47', NULL, NULL),
(23, 5, 'available', 'Zone Ultra - Seat 03', '2026-05-14 16:28:47', NULL, NULL),
(24, 6, 'available', 'Zone Ultra - Seat 04', '2026-05-14 16:28:47', NULL, NULL),
(25, 5, 'available', 'Zone Ultra - Seat 05', '2026-05-14 16:28:47', NULL, NULL),
(26, 6, 'available', 'Zone Ultra - Seat 06', '2026-05-14 16:28:47', NULL, NULL),
(27, 5, 'available', 'Zone Ultra - Seat 07', '2026-05-14 16:28:47', NULL, NULL),
(28, 6, 'available', 'Zone Ultra - Seat 08', '2026-05-14 16:28:47', NULL, NULL),
(29, 5, 'available', 'Zone Ultra - Seat 09', '2026-05-14 16:28:47', NULL, NULL),
(30, 6, 'available', 'Zone Ultra - Seat 10', '2026-05-14 16:28:47', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pc_specs`
--

CREATE TABLE `pc_specs` (
  `id` bigint(20) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pc_specs`
--

INSERT INTO `pc_specs` (`id`, `spec_name`, `cpu`, `gpu`, `ram`, `storage`, `os`, `price_per_hour`, `description`, `is_exclusive`, `is_available`, `created_at`) VALUES
(1, 'Basic Intel Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, 'Phù hợp gaming Esports 1080p mượt mà', 0, 1, '2026-05-14 16:28:47'),
(2, 'Basic AMD Ryzen Core', 'AMD Ryzen 5 5600X', 'AMD Radeon RX 6600', 16, 512, 'Windows 11', 2.50, 'Hiệu năng gaming thuần túy tối ưu chi phí', 0, 1, '2026-05-14 16:28:47'),
(3, 'Pro Intel Gaming', 'Intel Core i7-13700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 5.00, 'Chiến mượt AAA Max Setting và Livestream', 0, 1, '2026-05-14 16:28:47'),
(4, 'Pro Ryzen Performance', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 1024, 'Windows 11', 5.00, 'Đồ họa đỉnh cao, xử lý đa nhiệm mượt mà', 0, 1, '2026-05-14 16:28:47'),
(5, 'Ultra Intel Ultimate', 'Intel Core i9-14900K', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.00, 'Siêu quái vật Workstation chuyên render và 4K Gaming', 1, 1, '2026-05-14 16:28:47'),
(6, 'Ultra AMD Beast', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 64, 2048, 'Windows 11 Pro', 10.00, 'Cực đỉnh xử lý thuật toán AI và đồ họa nặng', 1, 1, '2026-05-14 16:28:47');

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
  `comment` varchar(255) DEFAULT NULL,
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
(1, 1, 2, 22, '2026-05-10 09:00:00', '2026-05-10 14:00:00', 0.00, 'ended'),
(2, 2, 3, 11, '2026-05-11 10:00:00', '2026-05-11 13:30:00', 0.00, 'ended'),
(3, 3, 4, 2, '2026-05-12 11:00:00', '2026-05-12 17:00:00', 15.00, 'ended'),
(4, 4, 5, 12, '2026-05-12 15:00:00', '2026-05-12 19:00:00', 20.00, 'ended'),
(5, 5, 6, 21, '2026-05-13 08:00:00', '2026-05-13 12:00:00', 0.00, 'ended');

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
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` bigint(20) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `duration_days` int(11) NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `max_hours_per_day` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `plan_name`, `spec_id`, `duration_days`, `price`, `max_hours_per_day`, `is_active`, `created_at`) VALUES
(1, 'Basic Intel - Weekly', 1, 7, 15.00, NULL, 1, '2026-05-14 16:28:47'),
(2, 'Basic AMD - Weekly', 2, 7, 15.00, NULL, 1, '2026-05-14 16:28:47'),
(3, 'Pro Intel - Monthly', 3, 30, 100.00, NULL, 1, '2026-05-14 16:28:47'),
(4, 'Pro AMD - Monthly', 4, 30, 100.00, NULL, 1, '2026-05-14 16:28:47'),
(5, 'Ultra Intel - Monthly', 5, 30, 200.00, NULL, 1, '2026-05-14 16:28:47'),
(6, 'Ultra AMD - Monthly', 6, 30, 200.00, NULL, 1, '2026-05-14 16:28:47'),
(7, 'Basic Intel - Monthly', 1, 30, 50.00, NULL, 1, '2026-05-14 16:28:47'),
(8, 'Basic AMD - Monthly', 2, 30, 50.00, NULL, 1, '2026-05-14 16:28:47'),
(9, 'Basic Intel - Yearly', 1, 365, 500.00, NULL, 1, '2026-05-14 16:28:47'),
(10, 'Basic AMD - Yearly', 2, 365, 500.00, NULL, 1, '2026-05-14 16:28:47'),
(11, 'Pro Intel - Weekly', 3, 7, 30.00, NULL, 1, '2026-05-14 16:28:47'),
(12, 'Pro AMD - Weekly', 4, 7, 30.00, NULL, 1, '2026-05-14 16:28:47'),
(13, 'Pro Intel - Yearly', 3, 365, 1000.00, NULL, 1, '2026-05-14 16:28:47'),
(14, 'Pro AMD - Yearly', 4, 365, 1000.00, NULL, 1, '2026-05-14 16:28:47'),
(15, 'Ultra Intel - Weekly', 5, 7, 60.00, NULL, 1, '2026-05-14 16:28:47'),
(16, 'Ultra AMD - Weekly', 6, 7, 60.00, NULL, 1, '2026-05-14 16:28:47'),
(17, 'Ultra Intel - Yearly', 5, 365, 2000.00, NULL, 1, '2026-05-14 16:28:47'),
(18, 'Ultra AMD - Yearly', 6, 365, 2000.00, NULL, 1, '2026-05-14 16:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `sunshine_hosts`
--

CREATE TABLE `sunshine_hosts` (
  `id` bigint(20) NOT NULL,
  `name` varchar(120) NOT NULL,
  `host_address` varchar(255) NOT NULL,
  `host_port` int(11) NOT NULL DEFAULT 47989,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `notes` varchar(500) DEFAULT NULL,
  `paired_client_uuid` varchar(128) DEFAULT NULL,
  `paired_client_name` varchar(120) DEFAULT NULL,
  `paired_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `pc_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sunshine_hosts`
--

INSERT INTO `sunshine_hosts` (`id`, `name`, `host_address`, `host_port`, `enabled`, `notes`, `paired_client_uuid`, `paired_client_name`, `paired_at`, `created_by`, `created_at`, `updated_at`, `pc_id`) VALUES
(1, 'Primary Sunshine Host', '58.187.67.90', 47989, 1, 'Initial host provided during Moonlight/Sunshine integration', NULL, NULL, NULL, NULL, '2026-05-12 15:37:22', '2026-05-12 15:37:22', 4);

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
(1, 'admin_cyber', 'Nguyen Van Admin', 'admin@onnetpc.com', '0911223344', '$2a$10$mhtsJJQPNjy2/oO7QzTQ7O', NULL, 'admin', NULL, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(2, 'quangthai26', 'Chu Nguyen Quang Thai', 'quangthai@gmail.com', '0988888888', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', NULL, 'user', 3, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(3, 'hoanglong99', 'Le Hoang Long', 'hoanglong99@gmail.com', '0977777777', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', NULL, 'user', 2, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(4, 'minhtu_dang', 'Dang Minh Tu', 'minhtu@gmail.com', '0966666666', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', NULL, 'user', 1, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(5, 'linhdan_pro', 'Tran Linh Dan', 'linhdan@gmail.com', '0955555555', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', NULL, 'user', 2, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(6, 'tienanh_dev', 'Nguyen Tien Anh', 'tienanh@gmail.com', '0944444444', '$2a$10$0Xlm1qRYccLG7LvzWdGN8e', NULL, 'user', 3, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(7, 'bavuong91', 'Nguyen Ba Vuong', 'vuongba@gmail.com', '0933333333', '$2a$10$0Xlm1qRY', NULL, 'user', 1, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(8, 'khanhhuyen', 'Pham Khanh Huyen', 'huyenkhanh@gmail.com', '0922222222', '$2a$10$0Xlm1qRY', NULL, 'user', 1, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(9, 'ducmanh_it', 'Vu Duc Manh', 'manhduc@gmail.com', '0911111111', '$2a$10$0Xlm1qRY', NULL, 'user', 2, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(10, 'thuha_98', 'Le Thu Ha', 'ha_thu98@gmail.com', '0900000000', '$2a$10$0Xlm1qRY', NULL, 'user', 2, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(11, 'quocbao_vp', 'Tran Quoc Bao', 'baoquoc@gmail.com', '0899999999', '$2a$10$0Xlm1qRY', NULL, 'user', 1, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(12, 'ngocanh_cute', 'Hoang Ngoc Anh', 'ngocanh@gmail.com', '0888888888', '$2a$10$0Xlm1qRY', NULL, 'user', 3, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(13, 'duyhung_gamer', 'Do Duy Hung', 'hungduy@gmail.com', '0877777777', '$2a$10$0Xlm1qRY', NULL, 'user', 3, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(14, 'thanhthuy_2k', 'Nguyen Thanh Thuy', 'thuythanh@gmail.com', '0866666666', '$2a$10$0Xlm1qRY', NULL, 'user', 1, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(15, 'vanphuc_it', 'Bui Van Phuc', 'phucvan@gmail.com', '0855555555', '$2a$10$0Xlm1qRY', NULL, 'user', 2, 1, 1, '2026-05-14 16:28:47', '0000-00-00 00:00:00', '0000-00-00 00:00:00');

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
  `balance` decimal(38,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `updated_at`) VALUES
(1, 1, 0.00, '2026-05-14 16:28:47'),
(2, 2, 450.00, '2026-05-14 16:28:47'),
(3, 3, 320.00, '2026-05-14 16:28:47'),
(4, 4, 150.00, '2026-05-14 16:28:47'),
(5, 5, 200.00, '2026-05-14 16:28:47'),
(6, 6, 600.00, '2026-05-14 16:28:47'),
(7, 7, 50.00, '2026-05-14 16:28:47'),
(8, 8, 35.00, '2026-05-14 16:28:47'),
(9, 9, 85.00, '2026-05-14 16:28:47'),
(10, 10, 120.00, '2026-05-14 16:28:47'),
(11, 11, 40.00, '2026-05-14 16:28:47'),
(12, 12, 300.00, '2026-05-14 16:28:47'),
(13, 13, 180.00, '2026-05-14 16:28:47'),
(14, 14, 25.00, '2026-05-14 16:28:47'),
(15, 15, 95.00, '2026-05-14 16:28:47');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `type` varchar(50) NOT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `wallet_id`, `amount`, `type`, `reference_id`, `note`, `created_at`) VALUES
(1, 2, 500.00, 'top_up', 1, 'Nạp tiền tài khoản qua PayPal', '2026-05-10 08:00:00'),
(2, 3, 350.00, 'top_up', 2, 'Nạp tiền tài khoản qua PayPal', '2026-05-11 09:15:00'),
(3, 4, 165.00, 'top_up', 3, 'Nạp tiền tài khoản qua PayPal', '2026-05-12 10:00:00'),
(4, 5, 220.00, 'top_up', 4, 'Nạp tiền tài khoản qua PayPal', '2026-05-12 14:20:00'),
(5, 6, 600.00, 'top_up', 5, 'Nạp tiền tài khoản qua PayPal', '2026-05-13 07:30:00'),
(6, 2, -200.00, 'deduct', 1, 'Thanh toán đăng ký gói tháng Ultra AMD', '2026-05-10 08:45:00'),
(7, 3, -100.00, 'deduct', 2, 'Thanh toán đăng ký gói tháng Pro Intel', '2026-05-11 09:45:00'),
(8, 4, -15.00, 'deduct', 3, 'Thanh toán thuê máy Basic AMD theo giờ', '2026-05-12 10:55:00'),
(9, 5, -20.00, 'deduct', 4, 'Thanh toán thuê máy Pro AMD theo giờ', '2026-05-12 14:50:00'),
(10, 6, -200.00, 'deduct', 5, 'Thanh toán đăng ký gói tháng Ultra Intel', '2026-05-13 07:45:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_recommendations`
--
ALTER TABLE `ai_recommendations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `spec_id` (`spec_id`),
  ADD KEY `pc_id` (`pc_id`),
  ADD KEY `idx_bookings_plan_id` (`plan_id`);

--
-- Indexes for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD PRIMARY KEY (`id`);

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
  ADD UNIQUE KEY `uq_membership_spec_single_tier` (`spec_id`);

--
-- Indexes for table `moonlight_command_logs`
--
ALTER TABLE `moonlight_command_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `moonlight_host_actions`
--
ALTER TABLE `moonlight_host_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_moonlight_actions_host` (`host_id`),
  ADD KEY `idx_moonlight_actions_booking` (`booking_id`),
  ADD KEY `idx_moonlight_actions_requested_by` (`requested_by`),
  ADD KEY `idx_moonlight_actions_status` (`status`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`);

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
  ADD UNIQUE KEY `booking_id` (`booking_id`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `session_queue`
--
ALTER TABLE `session_queue`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `spec_id` (`spec_id`);

--
-- Indexes for table `sunshine_hosts`
--
ALTER TABLE `sunshine_hosts`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `membership_tiers`
--
ALTER TABLE `membership_tiers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `membership_tier_spec_mappings`
--
ALTER TABLE `membership_tier_spec_mappings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `moonlight_command_logs`
--
ALTER TABLE `moonlight_command_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `moonlight_host_actions`
--
ALTER TABLE `moonlight_host_actions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pcs`
--
ALTER TABLE `pcs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `pc_specs`
--
ALTER TABLE `pc_specs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `sunshine_hosts`
--
ALTER TABLE `sunshine_hosts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `moonlight_host_actions`
--
ALTER TABLE `moonlight_host_actions`
  ADD CONSTRAINT `fk_moonlight_actions_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_moonlight_actions_host` FOREIGN KEY (`host_id`) REFERENCES `sunshine_hosts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_moonlight_actions_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
