-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: onnetpc-onnetpc2301.h.aivencloud.com    Database: onnetpc
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '6ec40d16-5199-11f1-8dd6-f2510ffee6c5:1-170,
b9709598-4fe7-11f1-a995-7eb1e69dbb46:1-523';

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `spec_id` bigint NOT NULL,
  `plan_id` bigint DEFAULT NULL,
  `pc_id` bigint DEFAULT NULL,
  `booking_type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `total_hours` int DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  `total_price` decimal(38,2) DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `spec_id` (`spec_id`),
  KEY `pc_id` (`pc_id`),
  KEY `idx_bookings_plan_id` (`plan_id`),
  CONSTRAINT `FK3nxmvygolj7erxhn958217hte` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`),
  CONSTRAINT `FKeyog2oic85xg7hsu2je2lx3s6` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKfvp8iutkq9v17xs3n9i63sa5x` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`),
  CONSTRAINT `FKrktu0pvrd3nyleycn7yh8ux1h` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,2,6,6,22,'subscription',NULL,'2026-05-17 05:28:51','2026-06-09 09:00:00',200.00,'completed','2026-05-10 08:45:00','2026-05-10 08:45:00'),(2,3,3,3,11,'subscription',NULL,'2026-05-17 05:28:51','2026-06-10 10:00:00',100.00,'completed','2026-05-11 09:45:00','2026-05-11 09:45:00'),(3,4,2,NULL,2,'hourly',6,'2026-05-17 05:28:51','2026-05-12 17:00:00',15.00,'completed','2026-05-12 10:55:00','2026-05-12 10:55:00'),(4,5,4,NULL,12,'hourly',4,'2026-05-17 05:28:51','2026-05-12 19:00:00',20.00,'completed','2026-05-12 14:50:00','2026-05-12 14:50:00'),(5,6,5,5,21,'subscription',NULL,'2026-05-17 05:28:51','2026-06-12 08:00:00',200.00,'completed','2026-05-13 07:45:00','2026-05-13 07:45:00'),(6,17,3,3,11,'subscription',NULL,'2026-05-15 03:00:47','2026-08-13 03:00:47',199.98,'paid','2026-05-15 03:00:46','2026-05-17 05:23:41'),(7,18,3,3,NULL,'subscription',NULL,'2026-05-15 05:38:05','2026-08-13 05:38:05',300.00,'cancelled','2026-05-15 05:38:04','2026-05-15 05:40:38'),(8,17,1,7,1,'subscription',NULL,'2026-05-15 06:38:52','2027-03-11 06:38:52',249.90,'paid','2026-05-15 06:38:51','2026-05-17 05:08:16'),(10,17,1,7,NULL,'subscription',NULL,'2026-05-15 06:55:38','2026-06-14 06:55:38',24.99,'cancelled','2026-05-15 06:55:38','2026-05-15 06:55:53'),(11,17,1,7,NULL,'subscription',NULL,'2026-05-15 07:32:51','2026-06-14 07:32:51',24.99,'cancelled','2026-05-15 07:32:50','2026-05-15 07:32:56'),(12,17,1,7,NULL,'subscription',NULL,'2026-05-15 09:34:39','2026-06-14 09:34:39',24.99,'cancelled','2026-05-15 09:34:38','2026-05-15 09:34:46'),(13,17,1,7,NULL,'subscription',NULL,'2026-05-15 09:35:18','2026-07-14 09:35:18',49.98,'cancelled','2026-05-15 09:35:18','2026-05-15 09:36:05'),(14,17,3,3,NULL,'subscription',NULL,'2026-05-15 09:35:41','2026-06-14 09:35:41',49.99,'cancelled','2026-05-15 09:35:40','2026-05-15 09:36:53'),(15,19,1,7,NULL,'subscription',NULL,'2026-05-15 10:10:10','2026-06-14 10:10:10',24.99,'paid','2026-05-15 10:10:09','2026-05-15 10:10:16'),(16,17,1,7,NULL,'subscription',NULL,'2026-05-15 11:12:35','2026-06-14 11:12:35',24.99,'cancelled','2026-05-15 11:12:35','2026-05-15 11:12:53'),(17,17,1,7,NULL,'subscription',NULL,'2026-05-15 11:16:14','2026-06-14 11:16:14',24.99,'cancelled','2026-05-15 11:16:14','2026-05-15 11:16:22'),(18,17,3,3,NULL,'subscription',NULL,'2026-05-15 11:30:15','2026-06-14 11:30:15',49.99,'cancelled','2026-05-15 11:30:14','2026-05-15 11:30:45'),(19,17,1,7,NULL,'subscription',NULL,'2026-05-17 05:07:26','2026-06-16 05:07:26',24.99,'cancelled','2026-05-17 05:07:25','2026-05-17 05:07:34'),(20,17,1,7,NULL,'subscription',NULL,'2026-05-17 05:08:08','2026-06-16 05:08:08',24.99,'cancelled','2026-05-17 05:08:07','2026-05-17 05:08:16'),(22,17,3,3,NULL,'subscription',NULL,'2026-05-17 05:23:23','2026-06-16 05:23:23',49.99,'cancelled','2026-05-17 05:23:22','2026-05-17 05:23:41');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_tokens`
--

DROP TABLE IF EXISTS `email_verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FKi1c4mmamlb8keqt74k4lrtwhc` (`user_id`),
  CONSTRAINT `FKi1c4mmamlb8keqt74k4lrtwhc` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_tokens`
--

LOCK TABLES `email_verification_tokens` WRITE;
/*!40000 ALTER TABLE `email_verification_tokens` DISABLE KEYS */;
INSERT INTO `email_verification_tokens` VALUES (1,17,'818699','2026-05-15 03:13:29',NULL,'2026-05-15 02:58:29'),(2,18,'700331','2026-05-15 05:03:10',NULL,'2026-05-15 04:48:10'),(3,19,'473845','2026-05-15 06:33:02',NULL,'2026-05-15 06:18:01'),(13,20,'914083','2026-05-17 05:18:58','2026-05-17 05:04:35','2026-05-17 05:03:57');
/*!40000 ALTER TABLE `email_verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moonlight_command_logs`
--

DROP TABLE IF EXISTS `moonlight_command_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moonlight_command_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `host_id` bigint NOT NULL,
  `requested_by` bigint DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `command_text` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `output_text` longtext COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finished_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmdqeuiqxywkbl57rh2fhjmr5r` (`host_id`),
  KEY `FKqt83v6cvyedkjryh6ueb5xslg` (`requested_by`),
  CONSTRAINT `FKmdqeuiqxywkbl57rh2fhjmr5r` FOREIGN KEY (`host_id`) REFERENCES `sunshine_hosts` (`id`),
  CONSTRAINT `FKqt83v6cvyedkjryh6ueb5xslg` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moonlight_command_logs`
--

LOCK TABLES `moonlight_command_logs` WRITE;
/*!40000 ALTER TABLE `moonlight_command_logs` DISABLE KEYS */;
INSERT INTO `moonlight_command_logs` VALUES (1,1,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.46 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 04:08:49',NULL),(2,1,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.46 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 04:10:49',NULL),(3,1,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.47 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 04:12:27',NULL),(4,1,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.47 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 04:13:47',NULL),(5,2,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.90 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:07:31',NULL),(6,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 202.93.156.66 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:22:20',NULL),(7,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 202.93.156.66 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:30:33',NULL),(8,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.47 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:32:35',NULL),(9,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.47 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:34:30',NULL),(10,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 58.187.67.47 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:36:54',NULL),(11,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 10.147.17.59 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:38:07',NULL),(12,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 10.147.17.59 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 10:53:56',NULL),(13,3,17,'STREAM','C:/Program Files/Moonlight Game Streaming/Moonlight.exe stream 10.147.17.59 Desktop -1080 -fps 60 -bitrate 8000','PREPARED',NULL,'2026-05-15 11:31:06',NULL);
/*!40000 ALTER TABLE `moonlight_command_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKk3ndxg5xp6v7wd4gjyusp15gq` (`user_id`),
  CONSTRAINT `FKk3ndxg5xp6v7wd4gjyusp15gq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `wallet_id` bigint NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `transaction_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_refundable` tinyint(1) DEFAULT '0',
  `refunded_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `wallet_id` (`wallet_id`),
  CONSTRAINT `FKsyphpqm12sfahaq5uyu9oj5dl` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,2,500.00,'paypal','success','TXN-THAI-777888',0,'2026-05-14 23:37:27','2026-05-10 08:00:00','2026-05-14 23:37:27'),(2,3,350.00,'paypal','success','TXN-LONG-112233',0,'2026-05-14 23:37:27','2026-05-11 09:15:00','2026-05-14 23:37:27'),(3,4,165.00,'paypal','success','TXN-TU-445566',0,'2026-05-14 23:37:27','2026-05-12 10:00:00','2026-05-14 23:37:27'),(4,5,220.00,'paypal','success','TXN-DAN-998877',0,'2026-05-14 23:37:27','2026-05-12 14:20:00','2026-05-14 23:37:27'),(5,6,600.00,'paypal','success','TXN-ANH-554433',0,'2026-05-14 23:37:27','2026-05-13 07:30:00','2026-05-14 23:37:27'),(6,16,1000.00,'paypal','pending','15J135753K561004B',0,NULL,NULL,'2026-05-15 04:43:02'),(7,16,1000.00,'paypal','success','78S910210V268445J',0,NULL,'2026-05-15 04:43:52','2026-05-15 04:43:31'),(8,18,25.00,'paypal','pending','8C8620569C6223423',0,NULL,NULL,'2026-05-15 06:38:22');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pc_specs`
--

DROP TABLE IF EXISTS `pc_specs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pc_specs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `spec_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cpu` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gpu` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ram` int DEFAULT NULL,
  `storage` int DEFAULT NULL,
  `os` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price_per_hour` decimal(38,2) DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_exclusive` tinyint(1) DEFAULT '0',
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pc_specs`
--

LOCK TABLES `pc_specs` WRITE;
/*!40000 ALTER TABLE `pc_specs` DISABLE KEYS */;
INSERT INTO `pc_specs` VALUES (1,'Basic Intel Starter','Intel Core i5-12400F','NVIDIA RTX 3060',16,512,'Windows 11',2.50,'Phù hợp gaming Esports 1080p mượt mà',0,1,'2026-05-14 23:37:25'),(2,'Basic AMD Ryzen Core','AMD Ryzen 5 5600X','AMD Radeon RX 6600',16,512,'Windows 11',2.50,'Hiệu năng gaming thuần túy tối ưu chi phí',0,1,'2026-05-14 23:37:25'),(3,'Pro Intel Gaming','Intel Core i7-13700F','NVIDIA RTX 4070',32,1024,'Windows 11',5.00,'Chiến mượt AAA Max Setting và Livestream',0,1,'2026-05-14 23:37:25'),(4,'Pro Ryzen Performance','AMD Ryzen 7 7700X','NVIDIA RTX 4070 Super',32,1024,'Windows 11',5.00,'Đồ họa đỉnh cao, xử lý đa nhiệm mượt mà',0,1,'2026-05-14 23:37:25'),(5,'Ultra Intel Ultimate','Intel Core i9-14900K','NVIDIA RTX 4090',64,2048,'Windows 11 Pro',10.00,'Siêu quái vật Workstation chuyên render và 4K Gaming',1,1,'2026-05-14 23:37:25'),(6,'Ultra AMD Beast','AMD Ryzen 9 7950X','NVIDIA RTX 4090',64,2048,'Windows 11 Pro',10.00,'Cực đỉnh xử lý thuật toán AI và đồ họa nặng',1,1,'2026-05-14 23:37:25');
/*!40000 ALTER TABLE `pc_specs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs`
--

DROP TABLE IF EXISTS `pcs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `spec_id` bigint NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'available',
  `location` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `spec_id` (`spec_id`),
  CONSTRAINT `FKbb3ywfe17u5m2a1vxsymaq2x8` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs`
--

LOCK TABLES `pcs` WRITE;
/*!40000 ALTER TABLE `pcs` DISABLE KEYS */;
INSERT INTO `pcs` VALUES (1,1,'available','Zone Basic - Seat 01','2026-05-15 11:32:06','2026-05-15 11:31:06',NULL),(2,2,'available','Zone Basic - Seat 02','2026-05-14 23:37:26',NULL,NULL),(3,1,'available','Zone Basic - Seat 03','2026-05-14 23:37:26',NULL,NULL),(4,2,'available','Zone Basic - Seat 04','2026-05-14 23:37:26',NULL,NULL),(5,1,'available','Zone Basic - Seat 05','2026-05-14 23:37:26',NULL,NULL),(6,2,'available','Zone Basic - Seat 06','2026-05-14 23:37:26',NULL,NULL),(7,1,'available','Zone Basic - Seat 07','2026-05-14 23:37:26',NULL,NULL),(8,2,'available','Zone Basic - Seat 08','2026-05-14 23:37:26',NULL,NULL),(9,1,'available','Zone Basic - Seat 09','2026-05-14 23:37:26',NULL,NULL),(10,2,'available','Zone Basic - Seat 10','2026-05-14 23:37:26',NULL,NULL),(11,3,'available','Zone Pro - Seat 01','2026-05-15 04:50:58','2026-05-15 04:13:47',NULL),(12,4,'available','Zone Pro - Seat 02','2026-05-14 23:37:26',NULL,NULL),(13,3,'available','Zone Pro - Seat 03','2026-05-14 23:37:26',NULL,NULL),(14,4,'available','Zone Pro - Seat 04','2026-05-14 23:37:26',NULL,NULL),(15,3,'available','Zone Pro - Seat 05','2026-05-14 23:37:26',NULL,NULL),(16,4,'available','Zone Pro - Seat 06','2026-05-14 23:37:26',NULL,NULL),(17,3,'available','Zone Pro - Seat 07','2026-05-14 23:37:26',NULL,NULL),(18,4,'available','Zone Pro - Seat 08','2026-05-14 23:37:26',NULL,NULL),(19,3,'available','Zone Pro - Seat 09','2026-05-14 23:37:26',NULL,NULL),(20,4,'available','Zone Pro - Seat 10','2026-05-14 23:37:26',NULL,NULL),(21,5,'available','Zone Ultra - Seat 01','2026-05-14 23:37:26',NULL,NULL),(22,6,'available','Zone Ultra - Seat 02','2026-05-14 23:37:26',NULL,NULL),(23,5,'available','Zone Ultra - Seat 03','2026-05-14 23:37:26',NULL,NULL),(24,6,'available','Zone Ultra - Seat 04','2026-05-14 23:37:26',NULL,NULL),(25,5,'available','Zone Ultra - Seat 05','2026-05-14 23:37:26',NULL,NULL),(26,6,'available','Zone Ultra - Seat 06','2026-05-14 23:37:26',NULL,NULL),(27,5,'available','Zone Ultra - Seat 07','2026-05-14 23:37:26',NULL,NULL),(28,6,'available','Zone Ultra - Seat 08','2026-05-14 23:37:26',NULL,NULL),(29,5,'available','Zone Ultra - Seat 09','2026-05-14 23:37:26',NULL,NULL),(30,6,'available','Zone Ultra - Seat 10','2026-05-14 23:37:26',NULL,NULL);
/*!40000 ALTER TABLE `pcs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `pc_id` bigint NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `FKckkaub5crl8ifvx0m763fglyq` (`pc_id`),
  KEY `FKcgy7qjc1r99dp117y9en6lxye` (`user_id`),
  CONSTRAINT `FK28an517hrxtt2bsg93uefugrm` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `FKcgy7qjc1r99dp117y9en6lxye` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKckkaub5crl8ifvx0m763fglyq` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_queue`
--

DROP TABLE IF EXISTS `session_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_queue` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `spec_id` bigint NOT NULL,
  `queue_position` int NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FKnrgyg1806xfjlfpmvn3snwf8q` (`booking_id`),
  KEY `FKoi7nt0poqdymwaxsgksvw6n4q` (`spec_id`),
  KEY `FKrr2ty2il6ri026um0va8valry` (`user_id`),
  CONSTRAINT `FKnrgyg1806xfjlfpmvn3snwf8q` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `FKoi7nt0poqdymwaxsgksvw6n4q` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`),
  CONSTRAINT `FKrr2ty2il6ri026um0va8valry` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_queue`
--

LOCK TABLES `session_queue` WRITE;
/*!40000 ALTER TABLE `session_queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `session_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `pc_id` bigint NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  `total_cost` decimal(38,2) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `user_id` (`user_id`),
  KEY `pc_id` (`pc_id`),
  CONSTRAINT `FK9sv19evftr9scoo1vdo2xu6vn` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `FKcy6ye7ugqfuq56ytg0ggg5a0o` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`),
  CONSTRAINT `FKruie73rneumyyd1bgo6qw8vjt` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (1,1,2,22,'2026-05-10 09:00:00','2026-05-10 14:00:00',0.00,'ended'),(2,2,3,11,'2026-05-11 10:00:00','2026-05-11 13:30:00',0.00,'ended'),(3,3,4,2,'2026-05-12 11:00:00','2026-05-12 17:00:00',15.00,'ended'),(4,4,5,12,'2026-05-12 15:00:00','2026-05-12 19:00:00',20.00,'ended'),(5,5,6,21,'2026-05-13 08:00:00','2026-05-13 12:00:00',0.00,'ended'),(6,6,17,11,'2026-05-15 03:24:08','2026-05-15 03:30:04',100.00,'ended'),(7,6,17,11,'2026-05-15 03:30:27','2026-05-15 03:30:38',100.00,'ended'),(8,6,17,11,'2026-05-15 03:33:26','2026-05-15 03:33:29',100.00,'ended'),(9,6,17,11,'2026-05-15 03:46:16','2026-05-15 03:46:56',100.00,'ended'),(10,6,17,11,'2026-05-15 03:47:38','2026-05-15 03:49:02',100.00,'ended'),(11,6,17,11,'2026-05-15 04:08:48','2026-05-15 04:09:22',100.00,'ended'),(12,6,17,11,'2026-05-15 04:10:49','2026-05-15 04:10:59',100.00,'ended'),(13,6,17,11,'2026-05-15 04:12:27','2026-05-15 04:13:32',100.00,'ended'),(14,6,17,11,'2026-05-15 04:13:47','2026-05-15 04:50:58',100.00,'ended'),(15,8,17,1,'2026-05-15 10:07:30','2026-05-15 10:09:59',149.94,'ended'),(16,8,17,1,'2026-05-15 10:22:19','2026-05-15 10:24:06',149.94,'ended'),(17,8,17,1,'2026-05-15 10:30:32','2026-05-15 10:32:32',149.94,'ended'),(18,8,17,1,'2026-05-15 10:32:35','2026-05-15 10:33:14',149.94,'ended'),(19,8,17,1,'2026-05-15 10:34:30','2026-05-15 10:36:51',149.94,'ended'),(20,8,17,1,'2026-05-15 10:36:54','2026-05-15 10:37:18',149.94,'ended'),(21,8,17,1,'2026-05-15 10:38:07','2026-05-15 10:38:39',149.94,'ended'),(22,8,17,1,'2026-05-15 10:53:56','2026-05-15 10:54:23',149.94,'ended'),(23,8,17,1,'2026-05-15 11:31:06','2026-05-15 11:32:06',199.92,'ended');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `spec_id` bigint NOT NULL,
  `duration_days` int NOT NULL,
  `price` decimal(38,2) NOT NULL,
  `max_hours_per_day` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `spec_id` (`spec_id`),
  CONSTRAINT `FKkeo76dmlqqblqixslfva6p2xs` FOREIGN KEY (`spec_id`) REFERENCES `pc_specs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'Basic Intel - Weekly',1,7,6.99,NULL,1,'2026-05-14 23:37:26'),(2,'Basic AMD - Weekly',2,7,6.99,NULL,1,'2026-05-14 23:37:26'),(3,'Pro Intel - Monthly',3,30,49.99,NULL,1,'2026-05-14 23:37:26'),(4,'Pro AMD - Monthly',4,30,49.99,NULL,1,'2026-05-14 23:37:26'),(5,'Ultra Intel - Monthly',5,30,69.99,NULL,1,'2026-05-14 23:37:26'),(6,'Ultra AMD - Monthly',6,30,69.99,NULL,1,'2026-05-14 23:37:26'),(7,'Basic Intel - Monthly',1,30,24.99,NULL,1,'2026-05-14 23:37:26'),(8,'Basic AMD - Monthly',2,30,24.99,NULL,1,'2026-05-14 23:37:26'),(9,'Basic Intel - Yearly',1,365,249.90,NULL,1,'2026-05-14 23:37:26'),(10,'Basic AMD - Yearly',2,365,249.90,NULL,1,'2026-05-14 23:37:26'),(11,'Pro Intel - Weekly',3,7,13.99,NULL,1,'2026-05-14 23:37:26'),(12,'Pro AMD - Weekly',4,7,13.99,NULL,1,'2026-05-14 23:37:26'),(13,'Pro Intel - Yearly',3,365,499.99,NULL,1,'2026-05-14 23:37:26'),(14,'Pro AMD - Yearly',4,365,499.99,NULL,1,'2026-05-14 23:37:26'),(15,'Ultra Intel - Weekly',5,7,20.99,NULL,1,'2026-05-14 23:37:26'),(16,'Ultra AMD - Weekly',6,7,20.99,NULL,1,'2026-05-14 23:37:26'),(17,'Ultra Intel - Yearly',5,365,749.99,NULL,1,'2026-05-14 23:37:26'),(18,'Ultra AMD - Yearly',6,365,749.99,NULL,1,'2026-05-14 23:37:26');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sunshine_hosts`
--

DROP TABLE IF EXISTS `sunshine_hosts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sunshine_hosts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `host_address` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `host_port` int NOT NULL DEFAULT '47989',
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `notes` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `pc_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcpl280wgw3s5ho4xxfou9bjxj` (`created_by`),
  KEY `FK5tpy2l413htle900imekg1lut` (`pc_id`),
  CONSTRAINT `FK5tpy2l413htle900imekg1lut` FOREIGN KEY (`pc_id`) REFERENCES `pcs` (`id`),
  CONSTRAINT `FKcpl280wgw3s5ho4xxfou9bjxj` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sunshine_hosts`
--

LOCK TABLES `sunshine_hosts` WRITE;
/*!40000 ALTER TABLE `sunshine_hosts` DISABLE KEYS */;
INSERT INTO `sunshine_hosts` VALUES (1,'Primary Sunshine Host','58.187.67.47',47989,1,'Test',NULL,'2026-05-12 22:37:22','2026-05-12 22:37:22',11),(2,'PC #30 - Ultra AMD Beast','11',47989,1,NULL,18,'2026-05-15 05:25:02','2026-05-15 10:36:40',30),(3,'PC #1 - Basic Intel Starter','10.147.17.59',47989,1,NULL,18,'2026-05-15 10:09:22','2026-05-15 10:37:52',1);
/*!40000 ALTER TABLE `sunshine_hosts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'user',
  `is_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin_cyber','Nguyen Van Admin','admin@onnetpc.com','0911223344','$2a$10$mhtsJJQPNjy2/oO7QzTQ7O',NULL,'admin',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(2,'quangthai26','Chu Nguyen Quang Thai','quangthai@gmail.com','0988888888','$2a$10$0Xlm1qRYccLG7LvzWdGN8e',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(3,'hoanglong99','Le Hoang Long','hoanglong99@gmail.com','0977777777','$2a$10$0Xlm1qRYccLG7LvzWdGN8e',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(4,'minhtu_dang','Dang Minh Tu','minhtu@gmail.com','0966666666','$2a$10$0Xlm1qRYccLG7LvzWdGN8e',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(5,'linhdan_pro','Tran Linh Dan','linhdan@gmail.com','0955555555','$2a$10$0Xlm1qRYccLG7LvzWdGN8e',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(6,'tienanh_dev','Nguyen Tien Anh','tienanh@gmail.com','0944444444','$2a$10$0Xlm1qRYccLG7LvzWdGN8e',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(7,'bavuong91','Nguyen Ba Vuong','vuongba@gmail.com','0933333333','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(8,'khanhhuyen','Pham Khanh Huyen','huyenkhanh@gmail.com','0922222222','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(9,'ducmanh_it','Vu Duc Manh','manhduc@gmail.com','0911111111','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(10,'thuha_98','Le Thu Ha','ha_thu98@gmail.com','0900000000','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(11,'quocbao_vp','Tran Quoc Bao','baoquoc@gmail.com','0899999999','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(12,'ngocanh_cute','Hoang Ngoc Anh','ngocanh@gmail.com','0888888888','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(13,'duyhung_gamer','Do Duy Hung','hungduy@gmail.com','0877777777','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(14,'thanhthuy_2k','Nguyen Thanh Thuy','thuythanh@gmail.com','0866666666','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(15,'vanphuc_it','Bui Van Phuc','phucvan@gmail.com','0855555555','$2a$10$0Xlm1qRY',NULL,'user',1,1,'2026-05-14 23:37:26','2026-05-17 05:28:51',NULL),(17,'scwar69','John Smith','scwar69@gmail.com','123123123','$2a$10$BtzJldiAJS3vTlgDv6q/hOAurlG6PIXh9zvaZq7CrVGwPSXBjE.pO',NULL,'user',1,1,'2026-05-15 02:58:28','2026-05-15 06:44:53',NULL),(18,'kruwulvn','Shiro','kruwulvn@gmail.com','131203','$2a$10$TFiPUyAwaXQpV6WjzOuxEOx2xjgunwNDfprFT7Y6tAzHcHABGxqu6',NULL,'admin',1,1,'2026-05-15 04:48:09','2026-05-15 04:49:07',NULL),(19,'nhatnamx698','Lê Nhật Nam','nhatnamx698@gmail.com','+84972363919','$2a$10$es17qp7AMMBmGy1cK8GtW.ky67o8Eqr2gC9l6lr7E9Tdrplv1Ph0i',NULL,'user',1,1,'2026-05-15 06:18:01','2026-05-15 06:20:14',NULL),(20,'quockhanh.nguyen2301','Khanh Nguyen','quockhanh.nguyen2301@gmail.com','+84825113336','$2a$10$bgJvObRbIR7NygFaWjZi0OCE07bct7EgnBhgQy8pdpwQ8GoIsj2/q',NULL,'user',1,1,'2026-05-15 06:42:28','2026-05-17 05:04:35','2026-05-17 03:02:14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_transactions`
--

DROP TABLE IF EXISTS `wallet_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `wallet_id` bigint NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK8seu7b87ifqi09ghhssusmb0x` (`wallet_id`),
  CONSTRAINT `FK8seu7b87ifqi09ghhssusmb0x` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_transactions`
--

LOCK TABLES `wallet_transactions` WRITE;
/*!40000 ALTER TABLE `wallet_transactions` DISABLE KEYS */;
INSERT INTO `wallet_transactions` VALUES (1,2,500.00,'top_up',1,'Nạp tiền tài khoản qua PayPal','2026-05-10 08:00:00'),(2,3,350.00,'top_up',2,'Nạp tiền tài khoản qua PayPal','2026-05-11 09:15:00'),(3,4,165.00,'top_up',3,'Nạp tiền tài khoản qua PayPal','2026-05-12 10:00:00'),(4,5,220.00,'top_up',4,'Nạp tiền tài khoản qua PayPal','2026-05-12 14:20:00'),(5,6,600.00,'top_up',5,'Nạp tiền tài khoản qua PayPal','2026-05-13 07:30:00'),(6,2,-200.00,'deduct',1,'Thanh toán đăng ký gói tháng Ultra AMD','2026-05-10 08:45:00'),(7,3,-100.00,'deduct',2,'Thanh toán đăng ký gói tháng Pro Intel','2026-05-11 09:45:00'),(8,4,-15.00,'deduct',3,'Thanh toán thuê máy Basic AMD theo giờ','2026-05-12 10:55:00'),(9,5,-20.00,'deduct',4,'Thanh toán thuê máy Pro AMD theo giờ','2026-05-12 14:50:00'),(10,6,-200.00,'deduct',5,'Thanh toán đăng ký gói tháng Ultra Intel','2026-05-13 07:45:00'),(11,16,-100.00,'deduct',6,'Booking payment','2026-05-15 03:02:57'),(12,16,1000.00,'top_up',7,'PayPal top-up order 78S910210V268445J','2026-05-15 04:43:51'),(13,16,-24.99,'deduct',8,'Booking payment','2026-05-15 06:39:16'),(14,16,-24.99,'deduct',10,'Booking payment','2026-05-15 06:55:52'),(15,16,-24.99,'deduct',11,'Booking payment','2026-05-15 07:32:56'),(16,16,-24.99,'deduct',12,'Booking payment','2026-05-15 09:34:45'),(17,16,-49.98,'deduct',13,'Booking payment','2026-05-15 09:36:04'),(18,18,-24.99,'deduct',15,'Booking payment','2026-05-15 10:10:16'),(19,16,-24.99,'deduct',16,'Booking payment','2026-05-15 11:12:52'),(20,16,-24.99,'deduct',17,'Booking payment','2026-05-15 11:16:22'),(21,16,-49.99,'deduct',18,'Booking payment','2026-05-15 11:30:44'),(22,16,-24.99,'deduct',19,'Booking payment','2026-05-17 05:07:34'),(23,16,-24.99,'deduct',20,'Booking payment','2026-05-17 05:08:16'),(24,16,-49.99,'deduct',22,'Booking payment','2026-05-17 05:23:41');
/*!40000 ALTER TABLE `wallet_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `balance` decimal(38,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `FKc1foyisidw7wqqrkamafuwn4e` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES (1,1,0.00,'2026-05-14 23:37:26'),(2,2,450.00,'2026-05-14 23:37:26'),(3,3,320.00,'2026-05-14 23:37:26'),(4,4,150.00,'2026-05-14 23:37:26'),(5,5,200.00,'2026-05-14 23:37:26'),(6,6,600.00,'2026-05-14 23:37:26'),(7,7,50.00,'2026-05-14 23:37:26'),(8,8,35.00,'2026-05-14 23:37:26'),(9,9,85.00,'2026-05-14 23:37:26'),(10,10,120.00,'2026-05-14 23:37:26'),(11,11,40.00,'2026-05-14 23:37:26'),(12,12,300.00,'2026-05-14 23:37:26'),(13,13,180.00,'2026-05-14 23:37:26'),(14,14,25.00,'2026-05-14 23:37:26'),(15,15,95.00,'2026-05-14 23:37:26'),(16,17,1550.12,'2026-05-17 05:23:41'),(17,18,0.00,'2026-05-15 04:48:10'),(18,19,975.01,'2026-05-15 10:10:16'),(19,20,0.00,'2026-05-15 06:42:28');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-17 12:45:16
