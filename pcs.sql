-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2026 at 02:24 PM
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
-- Table structure for table `pcs`
--

CREATE TABLE `pcs` (
  `id` bigint(20) NOT NULL,
  `spec_id` bigint(20) NOT NULL,
  `status` varchar(50) DEFAULT 'available',
  `location` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pcs`
--

INSERT INTO `pcs` (`id`, `spec_id`, `status`, `location`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'available', 'Zone A - Seat 01', '2026-03-16 13:20:32', NULL),
(2, 2, 'available', 'Zone A - Seat 02', '2026-03-16 13:20:32', NULL),
(3, 3, 'available', 'Zone A - Seat 03', '2026-03-16 13:20:32', NULL),
(4, 4, 'available', 'Zone B - Seat 01', '2026-03-16 13:20:32', NULL),
(5, 5, 'available', 'Zone B - Seat 02', '2026-03-16 13:20:32', NULL),
(6, 6, 'available', 'Zone B - Seat 03', '2026-03-16 13:20:32', NULL),
(7, 7, 'available', 'Zone C - Seat 01', '2026-03-16 13:20:32', NULL),
(8, 8, 'available', 'Zone C - Seat 02', '2026-03-16 13:20:32', NULL),
(9, 9, 'available', 'Zone C - Seat 03', '2026-03-16 13:20:32', NULL),
(10, 10, 'available', 'Zone D - Seat 01', '2026-03-16 13:20:32', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pcs`
--
ALTER TABLE `pcs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `spec_id` (`spec_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pcs`
--
ALTER TABLE `pcs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pcs`
--
ALTER TABLE `pcs`
  ADD CONSTRAINT `pcs_ibfk_1` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
