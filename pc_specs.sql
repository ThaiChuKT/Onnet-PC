-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2026 at 02:25 PM
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
(1, 'Nebula Starter', 'Intel Core i5-12400F', 'NVIDIA RTX 3060', 16, 512, 'Windows 11', 2.50, 'Entry gaming and school projects', 0, 1, '2026-03-16 13:20:32'),
(2, 'Nebula Plus', 'Intel Core i5-13400F', 'NVIDIA RTX 4060', 16, 1024, 'Windows 11', 3.20, '1080p ultra gaming and livestreaming', 0, 1, '2026-03-16 13:20:32'),
(3, 'Nebula Creator', 'AMD Ryzen 7 5700X', 'NVIDIA RTX 4060 Ti', 32, 1024, 'Windows 11', 3.80, 'Video editing and design workflows', 0, 1, '2026-03-16 13:20:32'),
(4, 'Orion Balanced', 'Intel Core i7-12700F', 'NVIDIA RTX 4070', 32, 1024, 'Windows 11', 4.70, 'Balanced gaming and productivity', 0, 1, '2026-03-16 13:20:32'),
(5, 'Orion Pro', 'AMD Ryzen 7 7700X', 'NVIDIA RTX 4070 Super', 32, 2048, 'Windows 11', 5.40, '4K content creation and rendering', 0, 1, '2026-03-16 13:20:32'),
(6, 'Atlas Gamer', 'Intel Core i7-13700K', 'NVIDIA RTX 4080', 32, 2048, 'Windows 11', 6.90, 'High refresh AAA gaming setup', 0, 1, '2026-03-16 13:20:32'),
(7, 'Atlas Creator', 'AMD Ryzen 9 7900X', 'NVIDIA RTX 4080 Super', 64, 2048, 'Windows 11', 7.80, 'Heavy Adobe and Blender projects', 0, 1, '2026-03-16 13:20:32'),
(8, 'Titan Workstation', 'Intel Core i9-13900K', 'NVIDIA RTX 4090', 64, 4096, 'Windows 11 Pro', 9.50, 'Workstation class compute and rendering', 1, 1, '2026-03-16 13:20:32'),
(9, 'Titan AI', 'AMD Ryzen 9 7950X', 'NVIDIA RTX 4090', 128, 4096, 'Ubuntu 22.04', 10.50, 'ML experiments and container workflows', 1, 1, '2026-03-16 13:20:32'),
(10, 'Zephyr Dev', 'AMD Ryzen 5 7600', 'NVIDIA RTX 3070', 32, 1024, 'Ubuntu 22.04', 4.20, 'Programming, docker, and test automation', 0, 1, '2026-03-16 13:20:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pc_specs`
--
ALTER TABLE `pc_specs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pc_specs`
--
ALTER TABLE `pc_specs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
