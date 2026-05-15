-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 12, 2026 at 08:24 PM
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
(1, 1, 2, NULL, 2, 'hourly', 1, '2026-03-27 06:04:24', '2026-03-27 07:04:24', 3.20, 'completed', '2026-03-27 13:04:24', '2026-03-27 06:34:22'),
(2, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 05:31:41', '2027-06-10 05:31:41', 712.80, 'cancelled', '2026-05-11 12:31:41', '2026-05-11 05:33:04'),
(3, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 05:33:20', '2027-05-11 05:33:20', 648.00, 'cancelled', '2026-05-11 12:33:20', '2026-05-11 05:34:07'),
(4, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 05:34:13', '2027-07-10 05:34:13', 777.60, 'cancelled', '2026-05-11 12:34:13', '2026-05-11 16:41:48'),
(5, 2, 8, NULL, 1, 'subscription', NULL, '2026-05-11 13:06:59', '2026-05-11 05:34:23', 114.00, 'completed', '2026-05-11 12:34:23', '2026-05-11 06:07:23'),
(6, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 16:48:38', '2026-08-23 16:48:38', 237.60, 'paid', '2026-05-11 23:48:38', '2026-05-11 21:47:16'),
(7, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 16:49:01', '2026-08-09 16:49:01', 194.40, 'cancelled', '2026-05-11 23:49:01', '2026-05-11 16:49:30'),
(8, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:00:42', '2026-06-10 17:00:42', 64.80, 'cancelled', '2026-05-12 00:00:42', '2026-05-11 17:00:48'),
(9, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:00:53', '2026-06-10 17:00:53', 64.80, 'cancelled', '2026-05-12 00:00:53', '2026-05-11 17:01:05'),
(10, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:01:36', '2026-06-10 17:01:36', 64.80, 'cancelled', '2026-05-12 00:01:36', '2026-05-11 17:21:02'),
(11, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:29:13', '2026-06-10 17:29:13', 64.80, 'cancelled', '2026-05-12 00:29:13', '2026-05-11 17:29:19'),
(12, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:29:28', '2026-06-10 17:29:28', 64.80, 'cancelled', '2026-05-12 00:29:28', '2026-05-11 17:41:45'),
(13, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:43:16', '2026-06-10 17:43:16', 64.80, 'cancelled', '2026-05-12 00:43:16', '2026-05-11 17:43:42'),
(14, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:44:27', '2026-06-10 17:44:27', 64.80, 'cancelled', '2026-05-12 00:44:27', '2026-05-11 17:58:56'),
(15, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 17:49:30', '2026-06-10 17:49:30', 114.00, 'cancelled', '2026-05-12 00:49:30', '2026-05-11 17:58:55'),
(16, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 17:59:13', '2026-06-10 17:59:13', 64.80, 'cancelled', '2026-05-12 00:59:13', '2026-05-11 18:00:03'),
(17, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 17:59:47', '2026-06-10 17:59:47', 114.00, 'cancelled', '2026-05-12 00:59:47', '2026-05-11 18:00:07'),
(18, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:00:11', '2026-06-10 18:00:11', 64.80, 'cancelled', '2026-05-12 01:00:11', '2026-05-11 18:19:04'),
(19, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 18:18:18', '2026-06-10 18:18:18', 114.00, 'cancelled', '2026-05-12 01:18:18', '2026-05-11 18:19:08'),
(20, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:19:11', '2026-06-10 18:19:11', 64.80, 'cancelled', '2026-05-12 01:19:11', '2026-05-11 18:42:53'),
(21, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 18:19:16', '2026-06-10 18:19:16', 114.00, 'cancelled', '2026-05-12 01:19:16', '2026-05-11 18:41:58'),
(22, 2, 8, NULL, 3, 'subscription', NULL, '2026-05-11 18:41:58', '2026-05-18 18:41:58', 38.00, 'paid', '2026-05-12 01:41:58', '2026-05-12 09:34:06'),
(23, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:42:58', '2027-05-11 18:42:58', 648.00, 'cancelled', '2026-05-12 01:42:58', '2026-05-11 18:43:39'),
(24, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 18:43:29', '2027-05-11 18:43:29', 1140.00, 'cancelled', '2026-05-12 01:43:29', '2026-05-11 18:43:41'),
(25, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:43:44', '2026-10-08 18:43:44', 324.00, 'cancelled', '2026-05-12 01:43:44', '2026-05-11 18:47:30'),
(26, 2, 1, NULL, NULL, 'subscription', NULL, '2026-05-11 18:44:59', '2026-06-10 18:44:59', 30.00, 'cancelled', '2026-05-12 01:44:59', '2026-05-11 18:47:31'),
(27, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:47:34', '2026-08-16 18:47:34', 216.00, 'cancelled', '2026-05-12 01:47:34', '2026-05-11 18:51:09'),
(28, 2, 1, NULL, NULL, 'subscription', NULL, '2026-05-11 18:51:12', '2026-05-25 18:51:12', 20.00, 'cancelled', '2026-05-12 01:51:12', '2026-05-11 18:51:25'),
(29, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:55:36', '2027-06-10 18:55:36', 712.80, 'cancelled', '2026-05-12 01:55:36', '2026-05-11 18:57:26'),
(30, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:57:29', '2026-07-10 18:57:29', 129.60, 'cancelled', '2026-05-12 01:57:29', '2026-05-11 18:57:49'),
(31, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:57:49', '2026-05-18 18:57:49', 21.60, 'cancelled', '2026-05-12 01:57:49', '2026-05-11 18:57:49'),
(32, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 18:59:30', '2026-07-10 18:59:30', 129.60, 'cancelled', '2026-05-12 01:59:30', '2026-05-11 19:01:43'),
(33, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:02:53', '2026-06-17 19:02:53', 86.40, 'cancelled', '2026-05-12 02:02:53', '2026-05-11 19:10:13'),
(34, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:10:19', '2026-06-10 19:10:19', 64.80, 'cancelled', '2026-05-12 02:10:19', '2026-05-11 19:10:24'),
(35, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:10:30', '2027-05-18 19:10:30', 669.60, 'cancelled', '2026-05-12 02:10:30', '2026-05-11 19:11:31'),
(36, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:11:33', '2026-08-09 19:11:33', 194.40, 'cancelled', '2026-05-12 02:11:33', '2026-05-11 19:17:54'),
(37, 2, 1, NULL, NULL, 'subscription', NULL, '2026-05-11 19:12:30', '2026-05-18 19:12:30', 10.00, 'cancelled', '2026-05-12 02:12:30', '2026-05-11 19:12:36'),
(38, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:17:57', '2026-06-10 19:17:57', 64.80, 'cancelled', '2026-05-12 02:17:57', '2026-05-11 19:18:04'),
(39, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:18:08', '2026-07-17 19:18:08', 151.20, 'cancelled', '2026-05-12 02:18:08', '2026-05-11 19:20:55'),
(40, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:20:58', '2026-06-10 19:20:58', 64.80, 'cancelled', '2026-05-12 02:20:58', '2026-05-11 19:24:29'),
(41, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:24:32', '2026-06-10 19:24:32', 64.80, 'cancelled', '2026-05-12 02:24:32', '2026-05-11 19:24:50'),
(42, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:25:06', '2026-06-10 19:25:06', 64.80, 'cancelled', '2026-05-12 02:25:06', '2026-05-11 19:27:36'),
(43, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:27:38', '2026-06-10 19:27:38', 64.80, 'cancelled', '2026-05-12 02:27:38', '2026-05-11 19:28:04'),
(44, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:28:07', '2026-06-10 19:28:07', 64.80, 'cancelled', '2026-05-12 02:28:07', '2026-05-11 19:31:21'),
(45, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:31:24', '2026-06-17 19:31:24', 86.40, 'cancelled', '2026-05-12 02:31:24', '2026-05-11 19:31:33'),
(46, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:31:37', '2026-06-17 19:31:37', 86.40, 'cancelled', '2026-05-12 02:31:37', '2026-05-11 19:31:45'),
(47, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:32:08', '2026-06-17 19:32:08', 86.40, 'cancelled', '2026-05-12 02:32:08', '2026-05-11 19:32:15'),
(48, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:32:39', '2026-06-17 19:32:39', 86.40, 'cancelled', '2026-05-12 02:32:39', '2026-05-11 19:39:05'),
(49, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 19:38:54', '2026-06-10 19:38:54', 114.00, 'cancelled', '2026-05-12 02:38:54', '2026-05-11 19:39:03'),
(50, 2, 1, NULL, NULL, 'subscription', NULL, '2026-05-11 19:39:01', '2026-06-10 19:39:01', 30.00, 'cancelled', '2026-05-12 02:39:01', '2026-05-11 19:44:05'),
(51, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:44:00', '2026-06-10 19:44:00', 64.80, 'cancelled', '2026-05-12 02:44:00', '2026-05-11 19:44:04'),
(52, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:44:08', '2026-08-09 19:44:08', 194.40, 'cancelled', '2026-05-12 02:44:08', '2026-05-11 19:44:18'),
(53, 2, 1, NULL, NULL, 'subscription', NULL, '2026-05-11 19:44:20', '2026-06-10 19:44:20', 30.00, 'cancelled', '2026-05-12 02:44:20', '2026-05-11 19:44:29'),
(54, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:44:23', '2026-06-10 19:44:23', 64.80, 'cancelled', '2026-05-12 02:44:23', '2026-05-11 19:44:28'),
(55, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 19:44:32', '2026-06-10 19:44:32', 114.00, 'cancelled', '2026-05-12 02:44:32', '2026-05-11 19:44:36'),
(56, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:44:39', '2027-06-17 19:44:39', 734.40, 'cancelled', '2026-05-12 02:44:39', '2026-05-11 19:44:55'),
(57, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:44:57', '2027-06-10 19:44:57', 712.80, 'cancelled', '2026-05-12 02:44:57', '2026-05-11 19:45:15'),
(58, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:45:35', '2027-08-16 19:45:35', 864.00, 'cancelled', '2026-05-12 02:45:35', '2026-05-11 19:46:56'),
(59, 2, 5, NULL, NULL, 'subscription', NULL, '2026-05-11 19:48:20', '2026-06-10 19:48:20', 64.80, 'cancelled', '2026-05-12 02:48:20', '2026-05-11 19:48:26'),
(60, 2, 8, NULL, NULL, 'subscription', NULL, '2026-05-11 19:48:20', '2026-07-10 19:48:20', 228.00, 'cancelled', '2026-05-12 02:48:20', '2026-05-11 19:48:25'),
(61, 2, 1, 91, NULL, 'subscription', NULL, '2026-05-11 19:57:35', '2026-05-18 19:57:35', 10.00, 'cancelled', '2026-05-12 02:57:35', '2026-05-11 19:57:43'),
(62, 2, 5, 110, NULL, 'subscription', NULL, '2026-05-11 19:57:37', '2026-06-10 19:57:37', 64.80, 'cancelled', '2026-05-12 02:57:37', '2026-05-11 19:57:42'),
(63, 2, 5, 95, NULL, 'subscription', NULL, '2026-05-11 19:57:46', '2026-05-18 19:57:46', 21.60, 'cancelled', '2026-05-12 02:57:46', '2026-05-11 19:57:56'),
(64, 2, 5, 110, NULL, 'subscription', NULL, '2026-05-11 19:57:48', '2026-06-10 19:57:48', 64.80, 'cancelled', '2026-05-12 02:57:48', '2026-05-11 19:57:55'),
(65, 2, 5, 95, NULL, 'subscription', NULL, '2026-05-11 20:01:31', '2026-05-18 20:01:31', 21.60, 'cancelled', '2026-05-12 03:01:31', '2026-05-11 21:47:16'),
(66, 2, 5, 110, NULL, 'subscription', NULL, '2026-05-11 22:06:40', '2027-01-06 22:06:40', 518.40, 'cancelled', '2026-05-12 05:06:40', '2026-05-12 08:38:07'),
(67, 2, 1, 91, 4, 'subscription', NULL, '2026-05-12 09:09:20', '2026-05-19 09:09:20', 10.00, 'paid', '2026-05-12 16:09:20', '2026-05-12 11:18:47');

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

--
-- Dumping data for table `moonlight_command_logs`
--

INSERT INTO `moonlight_command_logs` (`id`, `host_id`, `requested_by`, `action`, `command_text`, `status`, `output_text`, `created_at`, `finished_at`) VALUES
(1, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 -1080 -fps 60 -bitrate 8000', 'PREPARED', NULL, '2026-05-12 16:24:57', NULL),
(2, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 -1080 -fps 60 -bitrate 8000', 'PREPARED', NULL, '2026-05-12 16:26:04', NULL),
(3, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 -1080 -fps 60 -bitrate 8000', 'PREPARED', NULL, '2026-05-12 16:26:14', NULL),
(4, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 -1080 -fps 60 -bitrate 8000', 'PREPARED', NULL, '2026-05-12 16:26:57', NULL),
(5, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:34:07', '2026-05-12 09:35:07'),
(6, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:35:07', '2026-05-12 09:36:07'),
(8, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 --app Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:39:32', '2026-05-12 09:40:32'),
(9, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:41:07', '2026-05-12 09:42:07'),
(10, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:42:07', '2026-05-12 09:43:07'),
(11, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:43:26', '2026-05-12 09:44:26'),
(12, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:47:10', '2026-05-12 09:48:10'),
(14, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:50:07', '2026-05-12 09:51:07'),
(16, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:53:10', '2026-05-12 09:54:10'),
(17, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:54:10', '2026-05-12 09:55:10'),
(18, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:55:23', '2026-05-12 09:56:23'),
(20, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 16:57:28', '2026-05-12 09:58:28'),
(22, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 17:08:58', '2026-05-12 10:09:58'),
(24, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 17:47:35', '2026-05-12 10:48:35'),
(25, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 17:51:09', '2026-05-12 10:52:09'),
(26, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 17:51:36', '2026-05-12 10:52:36'),
(27, 1, 2, 'STREAM', 'C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000', 'FAILED', 'Timed out after 60s', '2026-05-12 17:54:49', '2026-05-12 10:55:49');

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

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `created_at`, `expires_at`, `token`, `used_at`, `user_id`) VALUES
(1, NULL, '2026-05-12 05:16:36.000000', '526463', '2026-05-12 05:02:12.000000', 2);

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
(1, 1, 1000.00, 'paypal', 'success', '11097797GY6922534', 0, '2026-03-27 13:03:27', '2026-03-27 06:03:51', '2026-03-27 13:03:27'),
(3, 2, 800.00, 'paypal', 'success', '2FS18515M5456580G', 0, '2026-05-11 12:54:26', '2026-05-11 05:56:18', '2026-05-11 12:54:26'),
(6, 2, 1000.00, 'paypal', 'success', '0PX80397MK5287106', 0, '2026-05-12 01:56:07', '2026-05-11 18:56:22', '2026-05-12 01:56:07');

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
(1, 1, 'available', 'Zone A - Seat 01', '2026-05-11 22:38:36', '2026-05-11 06:01:15', NULL),
(2, 2, 'available', 'Zone A - Seat 02', '2026-05-11 11:59:25', '2026-03-27 06:33:49', NULL),
(3, 3, 'available', 'Zone A - Seat 03', '2026-05-12 09:34:06', '2026-05-12 09:34:05', NULL),
(4, 4, 'available', 'Zone B - Seat 01', '2026-05-12 11:18:47', '2026-05-12 11:18:03', NULL),
(5, 5, 'available', 'Zone B - Seat 02', '2026-05-11 22:38:20', NULL, NULL),
(6, 6, 'available', 'Zone B - Seat 03', '2026-05-11 11:59:25', NULL, NULL),
(7, 7, 'available', 'Zone C - Seat 01', '2026-05-11 11:59:25', NULL, NULL),
(8, 8, 'available', 'Zone C - Seat 02', '2026-05-11 22:55:22', NULL, NULL),
(9, 9, 'available', 'Zone C - Seat 03', '2026-05-11 22:55:23', NULL, NULL),
(10, 10, 'available', 'Zone D - Seat 01', '2026-05-11 22:10:47', NULL, NULL);

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
(1, 'Nebula Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, 'Entry gaming and school projects', 0, 1, '2026-03-27 13:01:51'),
(2, 'Nebula Plus', 'Intel Core i5-13400F', 'NVIDIA RTX 4060', 16, 1024, 'Windows 11', 3.20, '1080p ultra gaming and livestreaming', 0, 1, '2026-03-27 13:01:51'),
(3, 'Nebula Creator', 'AMD Ryzen 7 5700X', 'NVIDIA RTX 4060 Ti', 32, 1024, 'Windows 11', 3.80, 'Video editing and design workflows', 0, 1, '2026-03-27 13:01:51'),
(4, 'Orion Balanced', 'Intel Core i7-12700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 4.70, 'Balanced gaming and productivity', 0, 1, '2026-03-27 13:01:51'),
(5, 'Orion Pro', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 2048, 'Windows 11', 5.40, '4K content creation and rendering', 0, 1, '2026-03-27 13:01:51'),
(6, 'Atlas Gamer', 'Intel Core i7-13700K', 'NVIDIA RTX 4080', 32, 2048, 'Windows 11', 6.90, 'High refresh AAA gaming setup', 0, 1, '2026-03-27 13:01:51'),
(7, 'Atlas Creator', 'AMD Ryzen 9 7900X', 'NVIDIA RTX 4080 Super', 64, 2048, 'Windows 11', 7.80, 'Heavy Adobe and Blender projects', 0, 1, '2026-03-27 13:01:51'),
(8, 'Titan Workstation', 'Intel Core i9-13900K', 'NVIDIA RTX 4090', 64, 4096, 'Windows 11 Pro', 9.50, 'Workstation class compute and rendering', 1, 1, '2026-03-27 13:01:51'),
(9, 'Titan AI', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 128, 4096, 'Ubuntu 22.04', 10.50, 'ML experiments and container workflows', 1, 1, '2026-03-27 13:01:51'),
(10, 'Zephyr Dev', 'AMD Ryzen 5 7600', 'NVIDIA RTX 3070', 32, 1024, 'Ubuntu 22.04', 4.20, 'Programming, docker, and test automation', 0, 1, '2026-03-27 13:01:51'),
(11, 'Test', 'cpu test', 'gpu test', 16, 512, '', 0.00, NULL, 0, 1, '2026-05-11 12:00:38');

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
(1, 1, 1, 2, '2026-03-27 06:33:49', '2026-03-27 06:34:22', 3.20, 'completed'),
(2, 5, 2, 1, '2026-05-11 06:01:15', '2026-05-11 06:07:23', 114.00, 'ended'),
(3, 22, 2, 3, '2026-05-11 20:02:34', '2026-05-11 20:02:35', 38.00, 'ended'),
(4, 22, 2, 3, '2026-05-11 20:02:36', '2026-05-11 20:02:36', 38.00, 'ended'),
(5, 22, 2, 3, '2026-05-11 22:10:56', '2026-05-11 22:11:18', 38.00, 'ended'),
(6, 22, 2, 3, '2026-05-11 22:30:45', '2026-05-11 22:30:52', 38.00, 'ended'),
(7, 22, 2, 3, '2026-05-11 22:38:25', '2026-05-11 22:38:33', 38.00, 'ended'),
(8, 22, 2, 3, '2026-05-12 08:45:09', '2026-05-12 08:45:11', 38.00, 'ended'),
(9, 22, 2, 3, '2026-05-12 08:52:08', '2026-05-12 08:52:09', 38.00, 'ended'),
(10, 22, 2, 3, '2026-05-12 08:57:27', '2026-05-12 08:57:29', 38.00, 'ended'),
(11, 22, 2, 3, '2026-05-12 08:57:30', '2026-05-12 08:57:32', 38.00, 'ended'),
(12, 22, 2, 3, '2026-05-12 09:06:20', '2026-05-12 09:06:27', 38.00, 'ended'),
(13, 22, 2, 3, '2026-05-12 09:08:55', '2026-05-12 09:08:57', 38.00, 'ended'),
(14, 22, 2, 3, '2026-05-12 09:08:58', '2026-05-12 09:08:59', 38.00, 'ended'),
(15, 67, 2, 4, '2026-05-12 09:09:34', '2026-05-12 09:09:40', 10.00, 'ended'),
(16, 67, 2, 4, '2026-05-12 09:10:42', '2026-05-12 09:10:44', 10.00, 'ended'),
(17, 67, 2, 4, '2026-05-12 09:23:42', '2026-05-12 09:23:48', 10.00, 'ended'),
(18, 67, 2, 4, '2026-05-12 09:23:54', '2026-05-12 09:24:22', 10.00, 'ended'),
(19, 67, 2, 4, '2026-05-12 09:24:23', '2026-05-12 09:24:24', 10.00, 'ended'),
(20, 67, 2, 4, '2026-05-12 09:24:30', '2026-05-12 09:24:35', 10.00, 'ended'),
(21, 67, 2, 4, '2026-05-12 09:24:57', '2026-05-12 09:26:02', 10.00, 'ended'),
(22, 67, 2, 4, '2026-05-12 09:26:04', '2026-05-12 09:26:07', 10.00, 'ended'),
(23, 67, 2, 4, '2026-05-12 09:26:14', '2026-05-12 09:26:22', 10.00, 'ended'),
(24, 67, 2, 4, '2026-05-12 09:26:57', '2026-05-12 09:27:02', 10.00, 'ended'),
(25, 22, 2, 3, '2026-05-12 09:34:05', '2026-05-12 09:34:06', 38.00, 'ended'),
(26, 67, 2, 4, '2026-05-12 09:34:07', '2026-05-12 09:38:10', 10.00, 'ended'),
(27, 67, 2, 4, '2026-05-12 09:35:07', '2026-05-12 09:38:08', 10.00, 'ended'),
(29, 67, 2, 4, '2026-05-12 09:39:32', '2026-05-12 09:41:04', 10.00, 'ended'),
(30, 67, 2, 4, '2026-05-12 09:41:07', '2026-05-12 09:43:07', 10.00, 'ended'),
(31, 67, 2, 4, '2026-05-12 09:42:07', '2026-05-12 09:43:20', 10.00, 'ended'),
(32, 67, 2, 4, '2026-05-12 09:43:26', '2026-05-12 09:47:05', 10.00, 'ended'),
(33, 67, 2, 4, '2026-05-12 09:47:10', '2026-05-12 09:49:58', 10.00, 'ended'),
(35, 67, 2, 4, '2026-05-12 09:50:07', '2026-05-12 09:53:00', 10.00, 'ended'),
(37, 67, 2, 4, '2026-05-12 09:53:10', '2026-05-12 09:54:54', 10.00, 'ended'),
(38, 67, 2, 4, '2026-05-12 09:54:10', '2026-05-12 09:55:16', 10.00, 'ended'),
(39, 67, 2, 4, '2026-05-12 09:55:23', '2026-05-12 09:57:26', 10.00, 'ended'),
(41, 67, 2, 4, '2026-05-12 09:57:28', '2026-05-12 10:08:53', 10.00, 'ended'),
(43, 67, 2, 4, '2026-05-12 10:08:58', '2026-05-12 10:24:22', 10.00, 'ended'),
(45, 67, 2, 4, '2026-05-12 10:47:35', '2026-05-12 10:47:41', 10.00, 'ended'),
(46, 67, 2, 4, '2026-05-12 10:51:09', '2026-05-12 10:51:14', 10.00, 'ended'),
(47, 67, 2, 4, '2026-05-12 10:51:36', '2026-05-12 10:51:38', 10.00, 'ended'),
(48, 67, 2, 4, '2026-05-12 10:54:49', '2026-05-12 10:58:31', 10.00, 'ended'),
(50, 67, 2, 4, '2026-05-12 11:11:08', '2026-05-12 11:11:14', 10.00, 'ended'),
(51, 67, 2, 4, '2026-05-12 11:11:19', '2026-05-12 11:11:43', 10.00, 'ended'),
(52, 67, 2, 4, '2026-05-12 11:14:11', '2026-05-12 11:14:13', 10.00, 'ended'),
(53, 67, 2, 4, '2026-05-12 11:14:30', '2026-05-12 11:14:36', 10.00, 'ended'),
(54, 67, 2, 4, '2026-05-12 11:18:03', '2026-05-12 11:18:47', 10.00, 'ended');

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
(91, 'Nebula Starter - Weekly', 1, 7, 10.00, NULL, 1, '2026-05-12 02:27:32'),
(92, 'Nebula Plus - Weekly', 2, 7, 12.80, NULL, 1, '2026-05-12 02:27:32'),
(93, 'Nebula Creator - Weekly', 3, 7, 15.20, NULL, 1, '2026-05-12 02:27:32'),
(94, 'Orion Balanced - Weekly', 4, 7, 18.80, NULL, 1, '2026-05-12 02:27:32'),
(95, 'Orion Pro - Weekly', 5, 7, 21.60, NULL, 1, '2026-05-12 02:27:32'),
(96, 'Atlas Gamer - Weekly', 6, 7, 27.60, NULL, 1, '2026-05-12 02:27:32'),
(97, 'Atlas Creator - Weekly', 7, 7, 31.20, NULL, 1, '2026-05-12 02:27:32'),
(98, 'Titan Workstation - Weekly', 8, 7, 38.00, NULL, 1, '2026-05-12 02:27:32'),
(99, 'Titan AI - Weekly', 9, 7, 42.00, NULL, 1, '2026-05-12 02:27:32'),
(100, 'Zephyr Dev - Weekly', 10, 7, 16.80, NULL, 1, '2026-05-12 02:27:32'),
(101, 'Test - Weekly', 11, 7, 0.00, NULL, 1, '2026-05-12 02:27:32'),
(106, 'Nebula Starter - Monthly', 1, 30, 30.00, NULL, 1, '2026-05-12 02:27:32'),
(107, 'Nebula Plus - Monthly', 2, 30, 38.40, NULL, 1, '2026-05-12 02:27:32'),
(108, 'Nebula Creator - Monthly', 3, 30, 45.60, NULL, 1, '2026-05-12 02:27:32'),
(109, 'Orion Balanced - Monthly', 4, 30, 56.40, NULL, 1, '2026-05-12 02:27:32'),
(110, 'Orion Pro - Monthly', 5, 30, 64.80, NULL, 1, '2026-05-12 02:27:32'),
(111, 'Atlas Gamer - Monthly', 6, 30, 82.80, NULL, 1, '2026-05-12 02:27:32'),
(112, 'Atlas Creator - Monthly', 7, 30, 93.60, NULL, 1, '2026-05-12 02:27:32'),
(113, 'Titan Workstation - Monthly', 8, 30, 114.00, NULL, 1, '2026-05-12 02:27:32'),
(114, 'Titan AI - Monthly', 9, 30, 126.00, NULL, 1, '2026-05-12 02:27:32'),
(115, 'Zephyr Dev - Monthly', 10, 30, 50.40, NULL, 1, '2026-05-12 02:27:32'),
(116, 'Test - Monthly', 11, 30, 0.00, NULL, 1, '2026-05-12 02:27:32'),
(121, 'Nebula Starter - Yearly', 1, 365, 300.00, NULL, 1, '2026-05-12 02:27:32'),
(122, 'Nebula Plus - Yearly', 2, 365, 384.00, NULL, 1, '2026-05-12 02:27:32'),
(123, 'Nebula Creator - Yearly', 3, 365, 456.00, NULL, 1, '2026-05-12 02:27:32'),
(124, 'Orion Balanced - Yearly', 4, 365, 564.00, NULL, 1, '2026-05-12 02:27:32'),
(125, 'Orion Pro - Yearly', 5, 365, 648.00, NULL, 1, '2026-05-12 02:27:32'),
(126, 'Atlas Gamer - Yearly', 6, 365, 828.00, NULL, 1, '2026-05-12 02:27:32'),
(127, 'Atlas Creator - Yearly', 7, 365, 936.00, NULL, 1, '2026-05-12 02:27:32'),
(128, 'Titan Workstation - Yearly', 8, 365, 1140.00, NULL, 1, '2026-05-12 02:27:32'),
(129, 'Titan AI - Yearly', 9, 365, 1260.00, NULL, 1, '2026-05-12 02:27:32'),
(130, 'Zephyr Dev - Yearly', 10, 365, 504.00, NULL, 1, '2026-05-12 02:27:32'),
(131, 'Test - Yearly', 11, 365, 0.00, NULL, 1, '2026-05-12 02:27:32');

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
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `pc_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sunshine_hosts`
--

INSERT INTO `sunshine_hosts` (`id`, `name`, `host_address`, `host_port`, `enabled`, `notes`, `created_by`, `created_at`, `updated_at`, `pc_id`) VALUES
(1, 'Primary Sunshine Host', '58.187.67.90', 47989, 1, 'Initial host provided during Moonlight/Sunshine integration', NULL, '2026-05-12 15:37:22', '2026-05-12 15:37:22', 4);

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
(1, 'kruwulvn', 'a$10$mhtsJJQPNjy2/oO7QzTQ7O9JhRm1IVBxpfbespKbjIaBBOs4qaoIq', NULL, 'admin', NULL, 1, 1, '2026-03-27 13:00:42', '2026-05-11 16:44:43', '2026-03-27 13:00:42'),
(2, 'scwar69', 'John Smith', 'scwar69@gmail.com', '123123123', '$2a$10$0Xlm1qRYccLG7LvzWdGN8eX0bVfjAiKZfvNnV4A728qSTa6bAcehG', NULL, 'user', NULL, 1, 1, '2026-05-11 12:09:51', '2026-05-11 22:02:12', '2026-05-11 12:09:51');Khanh', 'kruwulvn@gmail.com', '123123123', '$2

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
(1, 1, 996.80, '2026-03-27 06:04:33'),
(2, 2, 1400.40, '2026-05-12 09:09:23');

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
(1, 1, 1000.00, 'top_up', 1, 'PayPal top-up order 11097797GY6922534', '2026-03-27 13:03:51'),
(3, 1, -3.20, 'deduct', 1, 'Booking payment', '2026-03-27 13:04:33'),
(4, 2, 800.00, 'top_up', 3, 'PayPal top-up order 2FS18515M5456580G', '2026-05-11 12:56:18'),
(5, 2, -114.00, 'deduct', 5, 'Booking payment', '2026-05-11 12:59:53'),
(6, 2, -64.80, 'deduct', 6, 'Booking payment', '2026-05-11 23:48:46'),
(7, 2, -64.80, 'deduct', 11, 'Booking payment', '2026-05-12 00:29:19'),
(8, 2, -64.80, 'deduct', 12, 'Booking payment', '2026-05-12 00:41:45'),
(9, 2, -38.00, 'deduct', 22, 'Booking payment', '2026-05-12 01:41:58'),
(10, 2, 1000.00, 'top_up', 6, 'PayPal top-up order 0PX80397MK5287106', '2026-05-12 01:56:22'),
(11, 2, -21.60, 'deduct', 31, 'Booking payment', '2026-05-12 01:57:49'),
(12, 2, -21.60, 'deduct', 65, 'Booking payment', '2026-05-12 04:47:16'),
(13, 2, -10.00, 'deduct', 67, 'Booking payment', '2026-05-12 16:09:23');

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
  ADD KEY `pc_id` (`pc_id`),
  ADD KEY `idx_bookings_plan_id` (`plan_id`),
  ADD KEY `idx_bookings_spec_status` (`spec_id`,`status`);

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
-- Indexes for table `moonlight_command_logs`
--
ALTER TABLE `moonlight_command_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_moonlight_logs_host` (`host_id`),
  ADD KEY `idx_moonlight_logs_requested_by` (`requested_by`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKk3ndxg5xp6v7wd4gjyusp15gq` (`user_id`);

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
-- Indexes for table `sunshine_hosts`
--
ALTER TABLE `sunshine_hosts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sunshine_hosts_enabled` (`enabled`),
  ADD KEY `idx_sunshine_hosts_created_by` (`created_by`),
  ADD KEY `fk_sunshine_hosts_pc` (`pc_id`);

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
-- AUTO_INCREMENT for table `moonlight_command_logs`
--
ALTER TABLE `moonlight_command_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `pcs`
--
ALTER TABLE `pcs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `pc_specs`
--
ALTER TABLE `pc_specs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT for table `sunshine_hosts`
--
ALTER TABLE `sunshine_hosts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`),
  ADD CONSTRAINT `bookings_ibfk_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `membership_tier_spec_mappings`
--
ALTER TABLE `membership_tier_spec_mappings`
  ADD CONSTRAINT `membership_tier_spec_mappings_ibfk_1` FOREIGN KEY (`tier_id`) REFERENCES `membership_tiers` (`id`),
  ADD CONSTRAINT `membership_tier_spec_mappings_ibfk_2` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);

--
-- Constraints for table `moonlight_command_logs`
--
ALTER TABLE `moonlight_command_logs`
  ADD CONSTRAINT `fk_moonlight_logs_host` FOREIGN KEY (`host_id`) REFERENCES `sunshine_hosts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_moonlight_logs_requested_by` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
-- Constraints for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD CONSTRAINT `subscription_plans_ibfk_1` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);

--
-- Constraints for table `sunshine_hosts`
--
ALTER TABLE `sunshine_hosts`
  ADD CONSTRAINT `fk_sunshine_hosts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sunshine_hosts_pc` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`);

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
